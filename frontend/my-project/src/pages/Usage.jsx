import React from "react";
import { useNavigate } from "react-router-dom";

const Usage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      title: "Connect GitHub",
      description:
        "Connect your GitHub account and allow the platform to access your repositories.",
      icon: "🔗",
    },
    {
      number: "02",
      title: "Select Repository",
      description:
        "Choose the GitHub repository that you want to analyze and understand.",
      icon: "📁",
    },
    {
      number: "03",
      title: "Select a Code File",
      description:
        "Open your repository and select the specific code file you want to work with.",
      icon: "📄",
    },
    {
      number: "04",
      title: "Ask AI",
      description:
        "Use the AI Assistant to ask questions about your selected code.",
      icon: "🤖",
    },
    {
      number: "05",
      title: "Get AI Analysis",
      description:
        "The AI analyzes your code and provides explanations, bugs, optimization suggestions, and recommendations.",
      icon: "🧠",
    },
    {
      number: "06",
      title: "Improve Your Code",
      description:
        "Use the recommendations to improve code quality, performance, security, and maintainability.",
      icon: "🚀",
    },
  ];

  const questions = [
    "Explain this code",
    "Find bugs in this code",
    "How can I optimize this code?",
    "Review security issues",
    "How can I improve this code?",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <main>
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <span>✨</span>
            Getting Started
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            How to Use the Platform
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Analyze your GitHub projects, understand your code, find issues,
            and get AI-powered recommendations in a few simple steps.
          </p>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-2xl transition group-hover:scale-105">
                    {step.icon}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 text-xs font-bold tracking-widest text-blue-600">
                      STEP {step.number}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">
                      {step.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Questions */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl text-white shadow-lg shadow-blue-500/20">
                ✦
              </div>

              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                What Can You Ask AI?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Select a code file and ask the AI Assistant questions such as:
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    ?
                  </span>
                  {question}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RAG Explanation */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 text-white shadow-2xl sm:p-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                AI-Powered Analysis
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                How the AI understands your code
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                When you ask a question, the platform retrieves relevant
                information from your selected code and uses it as context for
                the AI. This helps provide answers based on your actual
                repository code.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-4">
                {[
                  ["01", "Your Question"],
                  ["02", "Code Retrieval"],
                  ["03", "AI Analysis"],
                  ["04", "Answer"],
                ].map(([number, title]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="text-xs font-bold text-blue-300">
                      {number}
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      {title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tip */}
        <section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="text-lg">💡</div>

            <h3 className="mt-2 font-bold text-slate-900">
              Helpful Tip
            </h3>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Always select the correct repository and code file before asking
              the AI. This helps the assistant focus its analysis on the code
              you are currently working with.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Ready to analyze your code?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Go to your dashboard and start exploring your repository.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Go to Dashboard
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Usage;