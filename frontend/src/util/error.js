import { toast } from "react-toastify";

const toastConfig = {
  position: "top-center",
  autoClose: 3000,
  className: "toast-custom"
};

export const handleSuccess = (msg) => {
  toast.success(msg, toastConfig);
};

export const handleError = (msg) => {
  toast.error(msg, toastConfig);
};