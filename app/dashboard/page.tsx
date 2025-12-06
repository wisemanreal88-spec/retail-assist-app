export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-zinc-900 dark:to-black">

      {/* NAVBAR */}
      <nav className="w-full flex justify-between items-center py-6 px-8">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          SamuelMarketplace AI
        </h1>

        <div className="flex gap-6 text-sm font-medium">
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400">
            Features
          </a>
          <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400">
            Pricing
          </a>
          <a
            href="/auth/login"
            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Login
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center mt-16 px-6">
        <h2 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight">
          Smart AI Assistant for Facebook, Instagram & Website Automation
        </h2>

        <p className="text-lg max-w-2xl mt-4 text-zinc-600 dark:text-zinc-300">
          Automate replies, close sales faster, and support customers 24/7.
          Powered by OpenAI + your unique business prompt using Supabase.
        </p>

        <a
          href="/auth/signup"
          className="mt-8 px-8 py-4 bg-blue-600 text-white text-lg rounded-full hover:bg-blue-700 transition"
        >
          Get Started Free
        </a>

        {/* Banner Mockup */}
        <div className="mt-16 w-full max-w-4xl bg-white dark:bg-zinc-900 shadow-xl p-6 rounded-2xl">
          <p className="text-zinc-700 dark:text-zinc-200 text-lg font-medium">
            “Your shop’s AI assistant is online — responding to customers instantly.”
          </p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="mt-32 px-6">
        <h3 className="text-3xl text-center font-bold">Core Features</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow">
            <h4 className="font-semibold text-lg">AI Auto-Replies</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
              Respond instantly on Facebook & Instagram — trained using your business prompt.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow">
            <h4 className="font-semibold text-lg">Website Chat Widget</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
              Install on your website in 2 minutes with a simple script.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow">
            <h4 className="font-semibold text-lg">Unified Inbox</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
              Handle all conversations from one dashboard — no switching apps.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="mt-32 px-6 pb-32">
        <h3 className="text-3xl text-center font-bold">Pricing Plans</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow flex flex-col">
            <h4 className="font-semibold text-xl">Starter</h4>
            <p className="text-3xl font-bold mt-4">P99/mo</p>
            <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">
              For small shops & new businesses.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow flex flex-col border-2 border-blue-600">
            <h4 className="font-semibold text-xl">Pro Business</h4>
            <p className="text-3xl font-bold mt-4">P299/mo</p>
            <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">
              For growing businesses that want full automation.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow flex flex-col">
            <h4 className="font-semibold text-xl">Enterprise / Whitelabel</h4>
            <p className="text-3xl font-bold mt-4">Custom</p>
            <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">
              Branded solution + resell rights + advanced AI usage.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}