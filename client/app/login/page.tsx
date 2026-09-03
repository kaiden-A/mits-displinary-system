import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Sign in was cancelled or not allowed.",
  invalid_state: "Sign in failed. Please try again.",
  token_exchange_failed: "Could not complete sign in. Please try again.",
  invalid_token: "Sign in verification failed. Please try again.",
  forbidden_org: "Your account is not authorized to access this system.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 mx-auto flex items-center justify-center text-white mb-4">
          <i className="fa-solid fa-shield-halved text-xl" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">SPSM · MITS</h1>
        <p className="text-sm text-slate-500 mt-1">Sistem Pembangunan Sahsiah Murid — Log masuk Staf</p>

        {error ? (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {ERROR_MESSAGES[error] || "Sign in failed. Please try again."}
          </p>
        ) : null}

        <a
          href="/api/auth/login"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
        >
          Sign in with Zitadel
        </a>

        <Link href="/login-pengawas" className="block mt-4 text-xs text-slate-400 hover:text-emerald-700">
          Log masuk pengawas (komputer awam) →
        </Link>
      </div>
    </div>
  );
}