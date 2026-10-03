import { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

// --------------------------------------------------
// Quick Actions
// --------------------------------------------------

const QUICK_ACTIONS = [
  {
    title: "Explain code",
    description: "Understand the selected file step by step.",
    icon: "✦",
    prompt:
      "Explain this code step by step in simple terms. Also explain the main functions and their responsibilities.",
  },
  {
    title: "Find bugs",
    description: "Identify bugs, edge cases and risky logic.",
    icon: "!",
    prompt:
      "Review this code carefully and identify possible bugs, edge cases and risky logic. Explain each issue in simple terms and suggest practical fixes.",
  },
  {
    title: "Improve code",
    description: "Improve readability and maintainability.",
    icon: "↗",
    prompt:
      "Review this code for code quality, readability and maintainability. Suggest practical improvements without changing the overall functionality.",
  },
  {
    title: "Security review",
    description: "Check common security vulnerabilities.",
    icon: "◈",
    prompt:
      "Perform a security review of this code. Identify possible security vulnerabilities, unsafe practices and authentication or authorization risks. Suggest practical fixes.",
  },
];

// --------------------------------------------------
// AI Assistant
// --------------------------------------------------

const AIAssistant = () => {
  // ------------------------------------------------
  // State
  // ------------------------------------------------

  const [repositories, setRepositories] = useState([]);
  const [files, setFiles] = useState([]);

  const [selectedRepository, setSelectedRepository] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState("");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [loadingRepositories, setLoadingRepositories] =
    useState(false);

  const [loadingFiles, setLoadingFiles] =
    useState(false);

  const [askingAI, setAskingAI] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------------------
  // Load repositories
  // ------------------------------------------------

  useEffect(() => {
    loadRepositories();
  }, []);

  // ------------------------------------------------
  // Repository change
  // ------------------------------------------------

  useEffect(() => {
    if (!selectedRepository) {
      setFiles([]);
      setSelectedFile("");
      return;
    }

    setMessages([]);
    setQuestion("");
    setError("");

    loadRepositoryFiles(selectedRepository);
  }, [selectedRepository]);

  // ------------------------------------------------
  // File change
  // ------------------------------------------------

  useEffect(() => {
    if (!selectedFile) {
      return;
    }

    setMessages([]);
    setQuestion("");
    setError("");
  }, [selectedFile]);

  // ------------------------------------------------
  // Selected repository
  // ------------------------------------------------

  const selectedRepositoryData = useMemo(() => {
    return repositories.find(
      (repository) =>
        String(repository._id || repository.id) ===
        String(selectedRepository)
    );
  }, [repositories, selectedRepository]);

  // ------------------------------------------------
  // Repository name
  // ------------------------------------------------

  const repositoryName =
    selectedRepositoryData?.name ||
    selectedRepositoryData?.fullName ||
    "Select repository";

  // ------------------------------------------------
  // File helper
  // ------------------------------------------------

  const getFilePath = (file) => {
    if (typeof file === "string") {
      return file;
    }

    return (
      file?.path ||
      file?.filePath ||
      file?.name ||
      ""
    );
  };

  // ------------------------------------------------
  // Load repositories
  // ------------------------------------------------

  const loadRepositories = async () => {
    try {
      setLoadingRepositories(true);
      setError("");

      const response = await axios.get("/repositories");

      const data =
        response.data?.data ||
        response.data?.repositories ||
        [];

      setRepositories(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load repositories:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load repositories."
      );
    } finally {
      setLoadingRepositories(false);
    }
  };

  // ------------------------------------------------
  // Load repository files
  // ------------------------------------------------

  const loadRepositoryFiles = async (
    repositoryId
  ) => {
    try {
      setLoadingFiles(true);
      setError("");

      setSelectedFile("");
      setFiles([]);

      const response = await axios.get(
        `/analysis/${repositoryId}/files`
      );

      const data =
        response.data?.data || [];

      setFiles(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load repository files:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load repository files."
      );
    } finally {
      setLoadingFiles(false);
    }
  };

  // ------------------------------------------------
  // Ask AI
  // ------------------------------------------------

  const askAI = async (
    customQuestion = null
  ) => {
    if (askingAI) {
      return;
    }

    const finalQuestion = String(
      customQuestion !== null
        ? customQuestion
        : question
    ).trim();

    if (!finalQuestion) {
      setError("Please enter a question.");
      return;
    }

    if (!selectedRepository) {
      setError("Please select a repository.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    try {
      setAskingAI(true);
      setError("");

      // --------------------------------------------
      // User message
      // --------------------------------------------

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: finalQuestion,
        filePath: selectedFile,
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);

      setQuestion("");

      // --------------------------------------------
      // API
      // --------------------------------------------

      const response = await axios.post(
        "/ai/ask",
        {
          question: finalQuestion,
          repositoryId: selectedRepository,
          filePath: selectedFile,
        }
      );

      const responseData =
        response.data || {};

      const aiData =
        responseData.data || {};

      // --------------------------------------------
      // Answer
      // --------------------------------------------

      const answer =
        responseData.answer ||
        aiData.answer ||
        aiData.insight?.description ||
        aiData.content ||
        aiData.response ||
        "";

      if (
        typeof answer !== "string" ||
        !answer.trim()
      ) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      // --------------------------------------------
      // Recommendations
      // --------------------------------------------

      let recommendations = [];

      if (
        Array.isArray(
          aiData.recommendations
        )
      ) {
        recommendations =
          aiData.recommendations;
      } else if (
        typeof aiData.insight?.recommendation ===
        "string"
      ) {
        recommendations =
          aiData.insight.recommendation
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
      }

      // --------------------------------------------
      // Issues
      // --------------------------------------------

      let issues = [];

      if (
        Array.isArray(aiData.issues)
      ) {
        issues = aiData.issues;
      } else if (
        Array.isArray(
          aiData.insight?.issues
        )
      ) {
        issues = aiData.insight.issues;
      }

      // --------------------------------------------
      // Sources
      // --------------------------------------------

      const sources =
        Array.isArray(aiData.sources)
          ? aiData.sources
          : [];

      // --------------------------------------------
      // AI message
      // --------------------------------------------

      const aiMessage = {
        id: crypto.randomUUID(),

        role: "assistant",

        content: answer,

        title:
          aiData.title ||
          aiData.insight?.title ||
          "AI Code Analysis",

        summary:
          aiData.summary ||
          aiData.insight?.summary ||
          "",

        recommendations,

        suggestedCode:
          aiData.suggestedCode ||
          aiData.insight?.suggestedCode ||
          "",

        severity:
          aiData.severity ||
          aiData.insight?.severity ||
          null,

        issues,

        sources,

        model:
          aiData.model ||
          aiData.insight?.model ||
          null,

        cached:
          responseData.cached === true,

        filePath: selectedFile,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (err) {
      console.error(
        "AI Assistant Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to generate AI response."
      );
    } finally {
      setAskingAI(false);
    }
  };

  // ------------------------------------------------
  // Keyboard
  // ------------------------------------------------

  const handleQuestionKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!askingAI) {
        askAI();
      }
    }
  };

  // ------------------------------------------------
  // Quick action
  // ------------------------------------------------

  const handleQuickAction = (
    prompt
  ) => {
    if (askingAI) {
      return;
    }

    if (
      !selectedRepository ||
      !selectedFile
    ) {
      setError(
        "Please select a repository and file first."
      );

      return;
    }

    setQuestion(prompt);
    askAI(prompt);
  };

  // ------------------------------------------------
  // Clear
  // ------------------------------------------------

  const clearChat = () => {
    if (askingAI) {
      return;
    }

    setMessages([]);
    setQuestion("");
    setError("");
  };

  // ------------------------------------------------
  // Render
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f7f9fc]">

      {/* ============================================
          Subtle background
      ============================================ */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="absolute -right-40 top-80 h-96 w-96 rounded-full bg-violet-100/40 blur-3xl" />

      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* ==========================================
            Page Header
        ========================================== */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-blue-200">
                AI
              </div>

              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Developer Productivity
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              AI Assistant
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Understand your code, find issues and
              get practical development suggestions
              using AI-powered repository context.
            </p>

          </div>

          <button
            type="button"
            onClick={clearChat}
            disabled={
              askingAI ||
              messages.length === 0
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear chat
          </button>

        </div>

        {/* ==========================================
            Error
        ========================================== */}

        {error && (
          <div className="mb-6 animate-[fadeDown_0.25s_ease-out] rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <div className="flex items-start gap-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 font-semibold text-red-600">
                !
              </div>

              <div className="flex-1">

                <p className="text-sm font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-lg leading-none text-red-400 hover:text-red-600"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* ==========================================
            Context Card
        ========================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Top accent */}

          <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500" />

          <div className="p-5 sm:p-6">

            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-base font-semibold text-slate-900">
                  Code Context
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose the repository and file you
                  want the AI to analyze.
                </p>

              </div>

              {selectedFile && (
                <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-xs font-medium text-emerald-700">
                    Context ready
                  </span>

                </div>
              )}

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {/* Repository */}

              <div>

                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Repository
                </label>

                <div className="relative">

                  <select
                    value={
                      selectedRepository
                    }
                    onChange={(event) =>
                      setSelectedRepository(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingRepositories ||
                      askingAI
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <option value="">
                      {loadingRepositories
                        ? "Loading repositories..."
                        : "Select repository"}
                    </option>

                    {repositories.map(
                      (repository) => {

                        const repositoryId =
                          repository._id ||
                          repository.id;

                        return (
                          <option
                            key={
                              repositoryId
                            }
                            value={
                              repositoryId
                            }
                          >
                            {repository.name ||
                              repository.fullName}
                          </option>
                        );
                      }
                    )}

                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    ▼
                  </span>

                </div>

              </div>

              {/* File */}

              <div>

                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">

                  <span>File</span>

                  {files.length > 0 && (
                    <span className="font-normal normal-case text-slate-400">
                      {files.length} files
                    </span>
                  )}

                </label>

                <div className="relative">

                  <select
                    value={selectedFile}
                    onChange={(event) =>
                      setSelectedFile(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedRepository ||
                      loadingFiles ||
                      askingAI
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <option value="">
                      {loadingFiles
                        ? "Loading files..."
                        : "Select file"}
                    </option>

                    {files.map(
                      (file, index) => {

                        const path =
                          getFilePath(
                            file
                          );

                        if (!path) {
                          return null;
                        }

                        return (
                          <option
                            key={`${path}-${index}`}
                            value={path}
                          >
                            {path}
                          </option>
                        );
                      }
                    )}

                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    ▼
                  </span>

                </div>

              </div>

            </div>

            {/* Selected file */}

            {selectedFile && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-600 shadow-sm">
                  {selectedFile
                    .split(".")
                    .pop()
                    ?.toUpperCase()
                    .slice(0, 4) || "FILE"}
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                    Active file
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                    {selectedFile}
                  </p>

                </div>

              </div>
            )}

          </div>
        </section>

        {/* ==========================================
            Main Layout
        ========================================== */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ========================================
              Chat
          ======================================== */}

          <section className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Chat Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-100">

                  <span className="animate-pulse">
                    ✦
                  </span>

                </div>

                <div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Ask about your code
                  </h2>

                  <div className="mt-0.5 flex items-center gap-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    <span className="text-[11px] text-slate-400">
                      AI assistant ready
                    </span>

                  </div>

                </div>

              </div>

              {selectedFile && (
                <div className="hidden max-w-xs rounded-lg bg-slate-50 px-3 py-2 sm:block">

                  <p className="max-w-xs truncate text-[11px] text-slate-500">
                    {selectedFile}
                  </p>

                </div>
              )}

            </div>

            {/* Chat body */}

            <div className="flex-1 overflow-y-auto bg-[#fbfcfe] p-5 sm:p-6">

              {messages.length === 0 ? (

                <div className="flex min-h-[430px] items-center justify-center">

                  <div className="max-w-md text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-2xl text-blue-600 shadow-sm ring-1 ring-blue-100">

                      <span className="animate-pulse">
                        ✦
                      </span>

                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-slate-900">
                      What can I help with?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Select a repository and file,
                      then ask the AI anything about
                      your code.
                    </p>

                    {!selectedFile && (
                      <p className="mt-4 text-xs font-medium text-blue-600">
                        Select a file above to get
                        started.
                      </p>
                    )}

                  </div>

                </div>

              ) : (

                <div className="space-y-5">

                  {messages.map(
                    (message) => {

                      const isUser =
                        message.role ===
                        "user";

                      return (
                        <div
                          key={
                            message.id
                          }
                          className="animate-[fadeUp_0.3s_ease-out]"
                        >

                          {isUser ? (

                            <div className="flex justify-end">

                              <div className="max-w-[85%]">

                                <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-white shadow-sm">

                                  <p className="whitespace-pre-wrap text-sm leading-6">
                                    {
                                      message.content
                                    }
                                  </p>

                                </div>

                                {message.filePath && (
                                  <p className="mt-1.5 truncate text-right text-[10px] text-slate-400">
                                    {message.filePath}
                                  </p>
                                )}

                              </div>

                            </div>

                          ) : (

                            <div className="flex gap-3">

                              {/* AI avatar */}

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm text-white shadow-sm">
                                ✦
                              </div>

                              <div className="min-w-0 max-w-[95%] flex-1">

                                <div className="overflow-hidden rounded-2xl rounded-tl-md border border-slate-200 bg-white shadow-sm">

                                  {/* AI title */}

                                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                                    <div>

                                      <p className="text-xs font-semibold text-slate-800">
                                        {message.title ||
                                          "AI Code Analysis"}
                                      </p>

                                      <p className="mt-0.5 text-[10px] text-slate-400">
                                        Repository-aware analysis
                                      </p>

                                    </div>

                                    {message.cached && (
                                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
                                        Cached
                                      </span>
                                    )}

                                  </div>

                                  <div className="p-5">

                                    {/* Summary */}

                                    {message.summary && (
                                      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                          Summary
                                        </p>

                                        <p className="text-sm leading-6 text-slate-700">
                                          {
                                            message.summary
                                          }
                                        </p>

                                      </div>
                                    )}

                                    {/* Answer */}

                                    <div>

                                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Analysis
                                      </p>

                                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                        {
                                          message.content
                                        }
                                      </p>

                                    </div>

                                    {/* Severity */}

                                    {message.severity && (
                                      <div className="mt-5 flex items-center gap-2">

                                        <span className="text-xs text-slate-400">
                                          Severity
                                        </span>

                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium capitalize text-amber-700">
                                          {
                                            message.severity
                                          }
                                        </span>

                                      </div>
                                    )}

                                    {/* Issues */}

                                    {message.issues?.length >
                                      0 && (
                                      <div className="mt-6">

                                        <div className="mb-3 flex items-center gap-2">

                                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                            !
                                          </div>

                                          <h4 className="text-sm font-semibold text-slate-800">
                                            Issues
                                          </h4>

                                          <span className="text-xs text-slate-400">
                                            {
                                              message
                                                .issues
                                                .length
                                            }
                                          </span>

                                        </div>

                                        <div className="space-y-2">

                                          {message.issues.map(
                                            (
                                              issue,
                                              index
                                            ) => (
                                              <div
                                                key={
                                                  index
                                                }
                                                className="rounded-xl border border-red-100 bg-red-50/50 p-3 transition hover:bg-red-50"
                                              >

                                                <div className="flex gap-3">

                                                  <span className="mt-1 text-red-500">
                                                    •
                                                  </span>

                                                  <p className="text-sm leading-6 text-slate-600">
                                                    {
                                                      issue
                                                    }
                                                  </p>

                                                </div>

                                              </div>
                                            )
                                          )}

                                        </div>

                                      </div>
                                    )}

                                    {/* Recommendations */}

                                    {message.recommendations?.length >
                                      0 && (
                                      <div className="mt-6">

                                        <div className="mb-3 flex items-center gap-2">

                                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            ✓
                                          </div>

                                          <h4 className="text-sm font-semibold text-slate-800">
                                            Recommendations
                                          </h4>

                                        </div>

                                        <div className="space-y-2">

                                          {message.recommendations.map(
                                            (
                                              recommendation,
                                              index
                                            ) => (
                                              <div
                                                key={
                                                  index
                                                }
                                                className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition hover:bg-emerald-50"
                                              >

                                                <div className="flex gap-3">

                                                  <span className="text-emerald-600">
                                                    ✓
                                                  </span>

                                                  <p className="text-sm leading-6 text-slate-600">
                                                    {
                                                      recommendation
                                                    }
                                                  </p>

                                                </div>

                                              </div>
                                            )
                                          )}

                                        </div>

                                      </div>
                                    )}

                                    {/* Suggested Code */}

                                    {message.suggestedCode && (
                                      <div className="mt-6">

                                        <div className="mb-3 flex items-center gap-2">

                                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-[10px] text-slate-600">
                                            {"</>"}
                                          </div>

                                          <h4 className="text-sm font-semibold text-slate-800">
                                            Suggested Code
                                          </h4>

                                        </div>

                                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">

                                          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">

                                            <span className="h-2 w-2 rounded-full bg-red-400" />
                                            <span className="h-2 w-2 rounded-full bg-yellow-400" />
                                            <span className="h-2 w-2 rounded-full bg-green-400" />

                                            <span className="ml-2 text-[10px] text-slate-500">
                                              suggested-code
                                            </span>

                                          </div>

                                          <pre className="max-h-96 overflow-auto p-4 text-xs leading-6 text-slate-300">
                                            <code>
                                              {
                                                message.suggestedCode
                                              }
                                            </code>
                                          </pre>

                                        </div>

                                      </div>
                                    )}

                                    {/* Sources */}

                                    {message.sources?.length >
                                      0 && (
                                      <div className="mt-6 border-t border-slate-100 pt-5">

                                        <div className="mb-3 flex items-center justify-between">

                                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            RAG Sources
                                          </p>

                                          <span className="text-[10px] text-slate-400">
                                            {
                                              message
                                                .sources
                                                .length
                                            }{" "}
                                            source
                                            {message
                                              .sources
                                              .length !==
                                            1
                                              ? "s"
                                              : ""}
                                          </span>

                                        </div>

                                        <div className="space-y-2">

                                          {message.sources.map(
                                            (
                                              source,
                                              index
                                            ) => (
                                              <div
                                                key={`${source.filePath}-${index}`}
                                                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                                              >

                                                <span className="text-[10px] font-semibold text-blue-500">
                                                  {index +
                                                    1}
                                                </span>

                                                <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
                                                  {
                                                    source.filePath
                                                  }
                                                </span>

                                                {source.language && (
                                                  <span className="rounded-md bg-white px-2 py-1 text-[9px] text-slate-400 shadow-sm">
                                                    {
                                                      source.language
                                                    }
                                                  </span>
                                                )}

                                              </div>
                                            )
                                          )}

                                        </div>

                                      </div>
                                    )}

                                    {/* Model */}

                                    {message.model && (
                                      <p className="mt-5 text-[10px] text-slate-400">
                                        Model:{" "}
                                        <span className="text-slate-500">
                                          {
                                            message.model
                                          }
                                        </span>
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </div>

                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                  {/* Thinking */}

                  {askingAI && (
                    <div className="flex animate-[fadeUp_0.3s_ease-out] gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm text-white">
                        <span className="animate-pulse">
                          ✦
                        </span>
                      </div>

                      <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">

                        <div className="flex items-center gap-3">

                          <div className="flex gap-1">

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />

                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />

                          </div>

                          <span className="text-xs text-slate-500">
                            Analyzing your code...
                          </span>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ========================================
                Input
            ======================================== */}

            <div className="border-t border-slate-100 bg-white p-4 sm:p-5">

              <div className="rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleQuestionKeyDown
                  }
                  disabled={askingAI}
                  rows={3}
                  placeholder={
                    selectedFile
                      ? "Ask anything about this file..."
                      : "Select a repository and file first..."
                  }
                  className="w-full resize-none bg-transparent px-4 pt-4 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                <div className="flex items-center justify-between px-3 pb-3">

                  <p className="hidden text-[10px] text-slate-400 sm:block">
                    Enter to send · Shift + Enter
                    for new line
                  </p>

                  <span className="sm:hidden" />

                  <button
                    type="button"
                    onClick={() =>
                      askAI()
                    }
                    disabled={
                      askingAI ||
                      !question.trim() ||
                      !selectedRepository ||
                      !selectedFile
                    }
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                  >

                    {askingAI ? (
                      <>
                        <span className="animate-spin">
                          ◌
                        </span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Ask AI
                        <span>→</span>
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* ========================================
              Right Sidebar
          ======================================== */}

          <aside className="space-y-5">

            {/* Quick Actions */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4">

                <h2 className="text-sm font-semibold text-slate-900">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Common code analysis tasks.
                </p>

              </div>

              <div className="space-y-2">

                {QUICK_ACTIONS.map(
                  (action) => (
                    <button
                      key={
                        action.title
                      }
                      type="button"
                      disabled={
                        askingAI ||
                        !selectedRepository ||
                        !selectedFile
                      }
                      onClick={() =>
                        handleQuickAction(
                          action.prompt
                        )
                      }
                      className="group w-full rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-blue-600 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white">
                          {
                            action.icon
                          }
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-semibold text-slate-800">
                            {
                              action.title
                            }
                          </p>

                          <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
                            {
                              action.description
                            }
                          </p>

                        </div>

                        <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                          →
                        </span>

                      </div>

                    </button>
                  )
                )}

              </div>

            </section>

            {/* Active Context */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-sm font-semibold text-slate-900">
                  Active Context
                </h2>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  Ready

                </span>

              </div>

              <div className="space-y-3">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Repository
                  </p>

                  <p className="mt-1 truncate text-xs font-medium text-slate-700">
                    {selectedRepository
                      ? repositoryName
                      : "Not selected"}
                  </p>

                </div>

                <div className="border-t border-slate-100 pt-3">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    File
                  </p>

                  <p className="mt-1 break-all text-xs font-medium text-slate-700">
                    {selectedFile ||
                      "Not selected"}
                  </p>

                </div>

                {selectedFile && (
                  <div className="border-t border-slate-100 pt-3">

                    <div className="flex items-center justify-between">

                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Retrieval
                      </span>

                      <span className="text-[10px] font-medium text-blue-600">
                        RAG enabled
                      </span>

                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* Small tip */}

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-violet-50 p-5">

              <div className="flex gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  ✦
                </div>

                <div>

                  <p className="text-xs font-semibold text-slate-800">
                    Better questions = better
                    answers
                  </p>

                  <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                    Select the exact file and
                    describe what you want to
                    understand or improve.
                  </p>

                </div>

              </div>

            </div>

          </aside>
        </div>

      </main>

      {/* ============================================
          Animations
      ============================================ */}

      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default AIAssistant;