# Signup email OTP

New accounts require email verification. Existing accounts keep their current login. OTP is sent to the email entered during signup, not to the phone number.

## Gmail setup

Enable Google 2-Step Verification and create a Google App Password. Put these values in backend/.env (ignored by Git):

~~~dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=Taskify <your-sender@gmail.com>
~~~

Use an App Password, not the Gmail account password. Keep JWT_KEY configured and stable. OTP_SECRET is optional; it defaults to JWT_KEY. Never put these credentials in frontend environment variables. Restart the backend after changing .env. No OTP is returned in API responses or written to logs. Missing or failed SMTP returns 503 and does not create an account.

Transport reference: https://nodemailer.com/smtp
Google App Password instructions: https://support.google.com/accounts/answer/185833

## 1. Request a code

POST /user/signup

~~~json
{"name":"Example User","email":"you@example.com","user_name":"example_user","number":"9999999999","password":"YourPassword123!"}
~~~

202 response:

~~~json
{"success":true,"verificationRequired":true,"message":"Verification code sent to your email.","email":"you@example.com","challengeId":"48-character-random-hex-string","expiresIn":600,"resendAfter":60}
~~~

This stores a temporary pending signup with a hashed password and keyed OTP hash in MongoDB. It does not create a User or return a JWT. Keep email and challengeId for the next requests. Challenge IDs must be the actual returned 48-character value.

## 2. Verify and create account

POST /user/signup/verify-otp

~~~json
{"email":"you@example.com","challengeId":"actual-returned-challenge-id","otp":"123456"}
~~~

OTP is a six-digit string and expires in 10 minutes. 201 returns success, message, jwtToken and users (name, email, user_name), and sets the auth cookie. The account includes emailVerifiedAt. Verification is claimed atomically to prevent duplicate account creation and code replay.

Five incorrect attempts lock the challenge. A used/expired/wrong challenge returns 400. No account is created on an incorrect or expired code.

## 3. Resend

POST /user/signup/resend-otp

~~~json
{"email":"you@example.com","challengeId":"actual-returned-challenge-id"}
~~~

202 returns a NEW challengeId, expiresIn and resendAfter. Replace the old challengeId and clear the input. The old code/session no longer works. Wait at least 60 seconds between sends. Pending records expire automatically; if the verification session is gone, start signup again.

## Errors and limits

- 400: invalid fields, incorrect/expired/used code or five-attempt limit.
- 409: email or username already registered. Sign in instead.
- 429: 60-second email cooldown, 10 sends per IP per 15 minutes, or 30 verify requests per IP per 15 minutes. Cooldown includes retryAfter seconds and Retry-After header.
- 503: SMTP unavailable or signup email not configured. Never treat it as successful delivery.
- 500: unexpected database/server error; client receives a generic message.

The IP limiter is per server process. For multiple backend instances, configure a shared rate-limit store. Behind a reverse proxy, configure Express trust proxy for your specific trusted infrastructure before deployment (never trust arbitrary forwarded headers).

## Local checks

Run npm test in backend for isolated MongoDB lifecycle tests (downloads a MongoDB test binary on first run). Tests do not use .env or the application database and capture mail in memory. Run npm run build in frontend. A passing test mail flow does not verify delivery to a real inbox; finish that check with the configured Gmail sender.
