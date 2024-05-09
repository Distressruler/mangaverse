import Image from "next/image";
import Link from "next/link";
import { SiDiscord } from "react-icons/si";
import prisma from "../../prisma/client";
import { redirect } from "next/navigation";

const BACKGROUND_IDS = ["1.jpg", "2.jpg", "3.gif", "4.gif", "5.jpg", "6.gif", "7.jpg", "8.jpg", "9.png", "10.jpg", "11.gif", "12.jpg", "13.gif", "14.jpg", "15.gif", "16.jpg", "17.jpg", "18.gif", "19.jpg"];

export default function Login() {
  async function loginOnSubmit(formData: FormData) {
    "use server";

    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    if (!username || !password) return;

    const user = await prisma.users.findUnique({ where: { username, password } });
    if (!user) return { error: "Either the username or the password is incorrect." };

    return redirect("/");
  }

  return (
    <div
      className="h-full"
      style={{
        backgroundImage: `url(/backgrounds/${BACKGROUND_IDS[Math.floor(Math.random() * BACKGROUND_IDS.length)]})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-center">
              <Link href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <Image className="w-8 h-8 mr-2" src="/icons/logo.png" alt="logo" width={32} height={32} />
                Enryu Manga
              </Link>
            </div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Sign in to your account</h1>
            <div className="flex items-center justify-center">
              <Link href="/login/discord">
                <button className="btn btn-outline text-black">
                  <SiDiscord size={32} color="#5865F2" className="mt-1" />
                  Login with Discord
                </button>
              </Link>
            </div>

            <div className="divider">OR</div>
            <form action={loginOnSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-red-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-red-600 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                <a href="/login/forgot" className="text-sm font-medium text-red-600 hover:underline dark:text-red-500">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              >
                Sign in
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <Link href="/login/signup" className="font-medium text-red-600 hover:underline dark:text-red-500">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
