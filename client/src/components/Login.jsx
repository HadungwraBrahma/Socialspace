import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import axiosInstance from "@/axiosInstance";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDelayMessage, setShowDelayMessage] = useState(false); // New state for delay message
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Show delay message after 5 seconds of loading
      const delayMessageTimeout = setTimeout(() => {
        setShowDelayMessage(true);
      }, 5000);

      const response = await axiosInstance.post("/api/v1/user/login", input, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(delayMessageTimeout); // Clear the timeout if the response is received
      setShowDelayMessage(false);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);

        dispatch(setAuthUser(response.data.user));

        navigate("/");

        toast.success(response.data.message);

        setInput({
          email: "",
          password: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={loginHandler}
        className="shadow-lg flex flex-col gap-5 p-8 w-[24rem] max-w-full"
      >
        <div>
          <h1 className="text-center font-bold text-xl">Socialspace</h1>
          <p className="text-sm text-center">
            Login to see photos and videos from your friend
          </p>
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="text"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Login</Button>
        )}
        <div
          className={`h-16 text-sm text-center text-gray-600 mt-2 w-37 ${
            showDelayMessage ? "" : "hidden"
          }`}
        >
          {loading && showDelayMessage && (
            <p>
              The first login may take longer since the backend server is hosted
              on a free platform. The server may need some time to wake up.
              Please wait.....^_^
            </p>
          )}
        </div>
        <span className="text-center">
          Doesn&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            Signup
          </Link>
        </span>
        <p className="text-sm text-center text-gray-500 mt-4">
          <strong>Note:</strong> For testing, use:
          <br />
          Email: <span className="font-mono">test@gmail.com</span>
          <br />
          Password: <span className="font-mono">123456</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
