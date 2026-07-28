import { useEffect, useState } from "react";
import { Award, CheckCircle2, Download, Printer, ShieldCheck, Sparkles, X } from "lucide-react";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";

type CertificateData = {
  certificateId: string;
  studentName: string;
  collegeName: string;
  eventTitle: string;
  organizerName: string;
  issuedAt: string;
  status: string;
  verificationHash: string;
};

export const CertificateModal = ({ eventId, onClose }: { eventId: string; onClose: () => void }) => {
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await api.get<{ data: CertificateData }>(`/events/${eventId}/certificate`);
        setCert(res.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load certificate.");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [eventId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900 p-4 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={22} />
            <h3 className="text-sm font-bold">TheScene Verified Digital Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            {cert && (
              <Button onClick={handlePrint} className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                <Printer size={14} /> Print / Save PDF
              </Button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-8 bg-slate-50 flex justify-center print:p-0 print:bg-white">
          {loading && <p className="text-xs text-slate-500 py-12 font-medium">Generating verified certificate credentials...</p>}
          {error && <p className="text-xs text-rose-600 py-12 font-semibold">{error}</p>}

          {cert && (
            <div
              id="certificate-print-area"
              className="w-full bg-white border-[12px] border-amber-600/80 p-10 rounded-xl shadow-xl relative overflow-hidden text-center font-serif text-slate-900 print:shadow-none print:border-8"
              style={{
                backgroundImage: "radial-gradient(circle at center, rgba(251, 191, 36, 0.04) 0%, transparent 70%)"
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 size-8 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute top-3 right-3 size-8 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute bottom-3 left-3 size-8 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute bottom-3 right-3 size-8 border-b-2 border-r-2 border-amber-500" />

              {/* Institution Header */}
              <div className="space-y-1">
                <p className="text-xs font-sans uppercase font-bold tracking-widest text-amber-600">
                  {cert.collegeName}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase font-sans">
                  Certificate of Achievement
                </h1>
                <p className="text-xs font-sans italic text-slate-500">This is officially awarded to</p>
              </div>

              {/* Recipient Name */}
              <div className="my-6 py-2 border-b-2 border-amber-400/50 inline-block px-12">
                <h2 className="text-3xl font-bold text-indigo-950 font-serif capitalize">
                  {cert.studentName}
                </h2>
              </div>

              {/* Description */}
              <p className="text-xs font-sans leading-relaxed text-slate-700 max-w-xl mx-auto">
                for successful participation and attendance at the campus event{" "}
                <strong className="text-slate-950 font-bold block text-sm my-1 font-serif">"{cert.eventTitle}"</strong>
                organized by <span>{cert.organizerName}</span> on{" "}
                <span className="font-semibold">{new Date(cert.issuedAt).toLocaleDateString()}</span>.
              </p>

              {/* Footer Badges & Signatures */}
              <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 items-end text-left font-sans">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Verification ID</p>
                  <p className="text-[11px] font-mono font-bold text-slate-900">{cert.certificateId}</p>
                  <p className="text-[9px] font-mono text-slate-500">Hash: {cert.verificationHash}</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-md border-2 border-amber-600 text-slate-950 mx-auto">
                    <ShieldCheck size={28} />
                  </div>
                  <span className="block text-[9px] font-bold uppercase text-amber-800 mt-1">
                    Verified Authentic
                  </span>
                </div>

                <div className="text-right">
                  <div className="inline-block border-b border-slate-400 px-6 pb-1">
                    <span className="font-serif italic text-xs text-indigo-900 font-bold">CampusConnect Committee</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase mt-1">Authorized Signature</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
