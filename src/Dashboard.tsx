import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function Dashboard() {
  const [view, setView] = useState<"overview" | "upload" | Id<"documents">>("overview");
  const documents = useQuery(api.documents.getUserDocuments);
  const deadlines = useQuery(api.deadlines.getUserDeadlines);

  if (documents === undefined || deadlines === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "overview" && (
          <OverviewView
            documents={documents}
            deadlines={deadlines}
            onUpload={() => setView("upload")}
            onViewDocument={(id) => setView(id)}
          />
        )}
        {view === "upload" && <UploadView onBack={() => setView("overview")} />}
        {typeof view === "string" && view.startsWith("j") && (
          <DocumentDetailView documentId={view as Id<"documents">} onBack={() => setView("overview")} />
        )}
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Immigration Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your documents and track important deadlines</p>
      </div>
    </div>
  );
}

function OverviewView({
  documents,
  deadlines,
  onUpload,
  onViewDocument,
}: {
  documents: any[];
  deadlines: any[];
  onUpload: () => void;
  onViewDocument: (id: Id<"documents">) => void;
}) {
  const upcomingDeadlines = deadlines.filter((d) => !d.completed).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Documents"
          value={documents.length}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Upcoming Deadlines"
          value={upcomingDeadlines.length}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Completed Tasks"
          value={deadlines.filter((d) => d.completed).length}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Upload Button */}
      <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload a Document</h3>
        <p className="text-gray-600 mb-4">Upload your I-94, I-20, or H-1B documents for AI analysis</p>
        <button
          onClick={onUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Upload Document
        </button>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Documents</h2>
        {documents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No documents uploaded yet. Upload your first document to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onClick={() => onViewDocument(doc._id)} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
        {upcomingDeadlines.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            No upcoming deadlines. They will appear here after document analysis.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineCard key={deadline._id} deadline={deadline} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadView({ onBack }: { onBack: () => void }) {
  const [selectedType, setSelectedType] = useState<"I-94" | "I-20" | "H-1B">("I-94");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.createDocument);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Create document record
      await createDocument({
        type: selectedType,
        fileName: file.name,
        fileId: storageId,
      });

      toast.success("Document uploaded successfully! AI analysis in progress...");
      onBack();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h2>

        {/* Document Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Document Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(["I-94", "I-20", "H-1B"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  selectedType === type
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max 10MB)</p>
            </label>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {uploading ? "Uploading..." : "Upload & Analyze"}
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Your document will be analyzed by AI to extract key information and deadlines.
        </p>
      </div>
    </div>
  );
}

function DocumentDetailView({
  documentId,
  onBack,
}: {
  documentId: Id<"documents">;
  onBack: () => void;
}) {
  const document = useQuery(api.documents.getDocument, { documentId });

  if (document === undefined) {
    return <LoadingSpinner />;
  }

  if (document === null) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Document not found</p>
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {document.type}
              </span>
              <StatusBadge status={document.status} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{document.fileName}</h2>
            <p className="text-gray-500 text-sm mt-1">
              Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Processing State */}
        {document.status === "processing" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <h3 className="font-semibold text-blue-900">Analyzing Document...</h3>
                <p className="text-blue-700 text-sm">Our AI is extracting key information from your document.</p>
              </div>
            </div>
          </div>
        )}

        {/* Failed State */}
        {document.status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">Analysis Failed</h3>
            <p className="text-red-700 text-sm">
              We couldn't analyze this document. Please try uploading again or contact support.
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {document.status === "completed" && document.analysisResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{document.analysisResult.summary}</p>
            </div>

            {/* Key Dates */}
            {document.analysisResult.keyDates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Dates</h3>
                <div className="space-y-3">
                  {document.analysisResult.keyDates.map((date, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <ImportanceIcon importance={date.importance} />
                        <div>
                          <p className="font-medium text-gray-900">{date.label}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(date.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {document.analysisResult.warnings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Warnings</h3>
                <div className="space-y-2">
                  {document.analysisResult.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-yellow-900 text-sm">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {document.analysisResult.nextSteps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Next Steps</h3>
                <ol className="space-y-2">
                  {document.analysisResult.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-blue-600">{icon}</div>
      </div>
    </div>
  );
}

function DocumentCard({ document, onClick }: { document: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {document.type}
            </span>
          </div>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 truncate">{document.fileName}</h3>
      <p className="text-sm text-gray-500">
        {new Date(document.uploadedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function DeadlineCard({ deadline }: { deadline: any }) {
  const toggleCompletion = useMutation(api.deadlines.toggleDeadlineCompletion);
  const daysUntil = Math.ceil(
    (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => toggleCompletion({ deadlineId: deadline._id })}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            deadline.completed
              ? "bg-green-600 border-green-600"
              : "border-gray-300 hover:border-blue-600"
          }`}
        >
          {deadline.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <ImportanceIcon importance={deadline.importance} />
        <div className="flex-1">
          <h4 className={`font-medium ${deadline.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
            {deadline.title}
          </h4>
          <p className="text-sm text-gray-600">{deadline.description}</p>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className={`text-sm font-medium ${
          daysUntil < 0 ? "text-red-600" : daysUntil < 7 ? "text-yellow-600" : "text-gray-600"
        }`}>
          {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
        </p>
        <p className="text-xs text-gray-500">{new Date(deadline.dueDate).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "processing" | "completed" | "failed" }) {
  const config = {
    processing: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Processing" },
    completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  };

  const { bg, text, label } = config[status];

  return (
    <span className={`px-2 py-1 ${bg} ${text} rounded text-xs font-medium`}>
      {label}
    </span>
  );
}

function ImportanceIcon({ importance }: { importance: "critical" | "important" | "info" }) {
  const config = {
    critical: { color: "text-red-600", bg: "bg-red-100" },
    important: { color: "text-yellow-600", bg: "bg-yellow-100" },
    info: { color: "text-blue-600", bg: "bg-blue-100" },
  };

  const { color, bg } = config[importance];

  return (
    <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
      <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {importance === "critical" && (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        )}
        {importance === "important" && (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
        {importance === "info" && (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )}
      </svg>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
