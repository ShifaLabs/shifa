import { signIn } from "next-auth/react";
function LoginWithGoogleButton() {
  const LoginWithGoogle = async () => {
    const result = await signIn("google");
    console.log(result);
  };
  return (
    <button
      onClick={LoginWithGoogle}
      className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
    >
      Login with Google
    </button>
  );
}

export default LoginWithGoogleButton;
