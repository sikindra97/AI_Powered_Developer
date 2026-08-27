import { useEffect, useState } from "react";
import axios from "../api/axios";

const QUICK_ACTIONS = [
  {
    title: "Explain this code",
    description: "Understand what this file does step by step.",
    prompt:
      "Explain this code step by step in simple terms. Also explain the main functions and their responsibilities.",
  },
  {
    title: "Find bugs",
    description: "Identify possible bugs and risky logic.",
    prompt:
      "Review this code carefully and identify possible bugs, edge cases and risky logic. Explain each issue in simple terms and suggest practical fixes.",
  },
  {
    title: "Improve code quality",
    description: "Get practical refactoring suggestions.",
    prompt:
      "Review this code for code quality, readability and maintainability. Suggest practical improvements without changing the overall functionality.",
  },
  {
    title: "Security review",
    description: "Check for common security problems.",
    prompt:
      "Perform a security review of this code. Identify possible security vulnerabilities, unsafe practices and authentication or authorization risks. Suggest practical fixes.",
  },
];

const AIAssistant = () => {
  const [repositories, setRepositories] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [askingAI, setAskingAI] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRepositories();
  }, []);

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

  useEffect(() => {
    if (!selectedFile) return;

    setMessages([]);
    setQuestion("");
    setError("");
  }, [selectedFile]);

  const loadRepositories = async () => {
    try {
      setLoadingRepositories(true);
      setError("");

      const response = await axios.get("/repositories");
      const data =
        response.data?.data ||
        response.data?.repositories ||
        [];

      setRepositories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load repositories:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load repositories."
      );
    } finally {
      setLoadingRepositories(false);
    }
  };

  const loadRepositoryFiles = async (repositoryId) => {
    try {
      setLoadingFiles(true);
      setError("");
      setSelectedFile("");
      setFiles([]);

      const response = await axios.get(
        `/analysis/${repositoryId}/files`
      );

      const data = response.data?.data || [];
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load repository files:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load repository files."
      );
    } finally {
      setLoadingFiles(false);
    }
  };

  const askAI = async (customQuestion = null) => {
    if (askingAI) return;

    const finalQuestion = String(
      customQuestion !== null ? customQuestion : question
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

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: finalQuestion,
        filePath: selectedFile,
      };

      setMessages((previous) => [...previous, userMessage]);
      setQuestion("");

      const response = await axios.post("/ai/ask", {
        question: finalQuestion,
        repositoryId: selectedRepository,
        filePath: selectedFile,
      });

      const responseData = response.data || {};
      const aiData = responseData.data || {};

      const answer =
        responseData.answer ||
        aiData.answer ||
        aiData.insight?.description ||
        aiData.content ||
        aiData.response ||
        "";

      if (typeof answer !== "string" || !answer.trim()) {
        throw new Error("AI returned an empty response.");
      }

      let recommendations = [];

      if (Array.isArray(aiData.recommendations)) {
        recommendations = aiData.recommendations;
      } else if (
        typeof aiData.insight?.recommendation === "string"
      ) {
        recommendations = aiData.insight.recommendation
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      let issues = [];

      if (Array.isArray(aiData.issues)) {
        issues = aiData.issues;
      } else if (Array.isArray(aiData.insight?.issues)) {
        issues = aiData.insight.issues;
      }

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
        model:
          aiData.model ||
          aiData.insight?.model ||
          null,
        cached: responseData.cached === true,
        filePath: selectedFile,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (err) {
      console.error("AI Assistant Error:", err);

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

  const handleQuestionKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!askingAI) {
        askAI();
      }
    }
  };

  const handleQuickAction = (prompt) => {
    if (askingAI) return;

    setQuestion(prompt);
    askAI(prompt);
  };

  const clearChat = () => {
    if (askingAI) return;

    setMessages([]);
    setQuestion("");
    setError("");
  };

  const getFilePath = (file) => {
    if (typeof file === "string") return file;

    return file?.path ||
      file?.filePath ||
      file?.name ||
      "";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              AI Assistant
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your intelligent coding companion
            </p>
          </div>

          <button
            type="button"
            onClick={clearChat}
            disabled={askingAI || messages.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear Chat
          </button>
        </div>

        <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-600">
          Ask questions about your GitHub code, understand complex
          logic, find bugs, improve code quality and review security
          issues with AI assistance.
        </p>

        {error && (
          <div className="mb-6 flex items-start justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 text-lg leading-none text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Code Context
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the repository and file you want the AI to
              understand.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Repository
              </label>

              <select
                value={selectedRepository}
                onChange={(event) =>
                  setSelectedRepository(event.target.value)
                }
                disabled={loadingRepositories || askingAI}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingRepositories
                    ? "Loading repositories..."
                    : "Select repository"}
                </option>

                {repositories.map((repository) => {
                  const repositoryId =
                    repository._id || repository.id;

                  return (
                    <option
                      key={repositoryId}
                      value={repositoryId}
                    >
                      {repository.name ||
                        repository.fullName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                File
              </label>

              <select
                value={selectedFile}
                onChange={(event) =>
                  setSelectedFile(event.target.value)
                }
                disabled={
                  !selectedRepository ||
                  loadingFiles ||
                  askingAI
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingFiles
                    ? "Loading files..."
                    : "Select file"}
                </option>

                {files.map((file, index) => {
                  const path = getFilePath(file);

                  if (!path) return null;

                  return (
                    <option
                      key={`${path}-${index}`}
                      value={path}
                    >
                      {path}
                    </option>
                  );
                })}
              </select>

              {files.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {files.length} files available
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Ask about your code
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  AI-powered code assistance
                </p>
              </div>

              {selectedFile && (
                <span className="hidden max-w-xs truncate rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-600 sm:block">
                  {selectedFile}
                </span>
              )}
            </div>

            <div className="max-h-[650px] min-h-[320px] overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="flex min-h-[280px] items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                      ✦
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      What can I help with?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Select a repository and file, then ask the
                      AI anything about your code.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={message.id}
                        className={
                          isUser
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >
                        <div
                          className={
                            isUser
                              ? "max-w-[90%] rounded-xl rounded-br-sm bg-blue-600 px-4 py-3 text-white"
                              : "w-full max-w-[95%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-4"
                          }
                        >
                          {isUser ? (
                            <>
                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {message.content}
                              </p>

                              {message.filePath && (
                                <p className="mt-2 truncate text-xs text-blue-100">
                                  {message.filePath}
                                </p>
                              )}
                            </>
                          ) : (
                            <div>
                              {message.title && (
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <h3 className="text-lg font-semibold text-slate-900">
                                    {message.title}
                                  </h3>

                                  {message.cached && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium uppercase text-green-700">
                                      Cached
                                    </span>
                                  )}
                                </div>
                              )}

                              {message.summary && (
                                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
                                  <p className="mb-1 text-xs font-semibold uppercase text-blue-600">
                                    Summary
                                  </p>

                                  <p className="text-sm leading-6 text-slate-700">
                                    {message.summary}
                                  </p>
                                </div>
                              )}

                              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                {message.content}
                              </p>

                              {message.severity && (
                                <div className="mt-4">
                                  <span className="text-xs font-medium text-slate-500">
                                    Severity
                                  </span>

                                  <span className="ml-2 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                                    {message.severity}
                                  </span>
                                </div>
                              )}

                              {message.issues?.length > 0 && (
                                <div className="mt-5">
                                  <h4 className="mb-2 font-semibold text-slate-900">
                                    Issues
                                  </h4>

                                  <ul className="space-y-2">
                                    {message.issues.map(
                                      (issue, index) => (
                                        <li
                                          key={index}
                                          className="flex gap-2 text-sm leading-6 text-slate-700"
                                        >
                                          <span className="text-red-500">
                                            •
                                          </span>
                                          <span>{issue}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {message.recommendations?.length >
                                0 && (
                                <div className="mt-5">
                                  <h4 className="mb-2 font-semibold text-slate-900">
                                    Recommendations
                                  </h4>

                                  <ul className="space-y-2">
                                    {message.recommendations.map(
                                      (
                                        recommendation,
                                        index
                                      ) => (
                                        <li
                                          key={index}
                                          className="flex gap-2 text-sm leading-6 text-slate-700"
                                        >
                                          <span className="text-blue-600">
                                            •
                                          </span>
                                          <span>
                                            {recommendation}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {message.suggestedCode && (
                                <div className="mt-5">
                                  <h4 className="mb-2 font-semibold text-slate-900">
                                    Suggested Code
                                  </h4>

                                  <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-6 text-slate-100">
                                    <code>
                                      {message.suggestedCode}
                                    </code>
                                  </pre>
                                </div>
                              )}

                              {message.model && (
                                <p className="mt-4 text-[11px] text-slate-400">
                                  Model: {message.model}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {askingAI && (
                    <div className="flex justify-start">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                          </div>

                          <span className="text-sm text-slate-500">
                            AI is analyzing your code...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-5">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={handleQuestionKeyDown}
                disabled={askingAI}
                rows={4}
                placeholder="Ask about your code..."
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Press Enter to send • Shift + Enter for a new line
                </p>

                <button
                  type="button"
                  onClick={() => askAI()}
                  disabled={
                    askingAI ||
                    !question.trim() ||
                    !selectedRepository ||
                    !selectedFile
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {askingAI ? "Analyzing..." : "Ask AI"}
                </button>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Start with one of these common tasks.
            </p>

            <div className="mt-4 space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  disabled={
                    askingAI ||
                    !selectedRepository ||
                    !selectedFile
                  }
                  onClick={() =>
                    handleQuickAction(action.prompt)
                  }
                  className="group w-full rounded-lg border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {action.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {action.description}
                      </p>
                    </div>

                    <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Tips for better answers
              </h3>

              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                <li>• Select the exact file related to your question.</li>
                <li>• Describe the problem clearly.</li>
                <li>• Ask the AI to explain before requesting a refactor.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;