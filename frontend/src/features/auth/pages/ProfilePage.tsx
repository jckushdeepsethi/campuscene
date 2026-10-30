import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, GraduationCap, Heart, Save, User } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useCurrentUser } from "../hooks/useAuth";
import { usersApi } from "../services/authApi";

const INTEREST_OPTIONS = [
  "Coding",
  "Hackathons",
  "AI / ML",
  "Web Dev",
  "Music",
  "Dance",
  "Cultural",
  "Placements",
  "Career Prep",
  "Robotics",
  "Hardware & IoT",
  "Sports",
  "Arts & Drama",
  "Networking",
  "Workshops",
  "Leadership"
];

export const ProfilePage = () => {
  const { data: user, refetch } = useCurrentUser();

  const [name, setName] = useState(user?.name ?? "");
  const [collegeName, setCollegeName] = useState(user?.collegeName ?? "");
  const [rollNumber, setRollNumber] = useState(user?.rollNumber ?? "");
  const [branch, setBranch] = useState(user?.branch ?? "");
  const [passingYear, setPassingYear] = useState<number | string>(user?.passingYear ?? "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests ?? []);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    try {
      await usersApi.updateProfile({
        name,
        collegeName,
        rollNumber,
        branch,
        passingYear: passingYear ? Number(passingYear) : undefined,
        interests: selectedInterests
      });
      await refetch();
      setSuccessMessage("Profile and interest preferences saved successfully!");
    } catch {
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/events">
              <Button variant="ghost" className="size-9 p-0">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-semibold text-primary">CampuScene</p>
              <h1 className="text-2xl font-bold text-slate-950">Student Profile & Interest Preferences</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        <form onSubmit={handleSave} className="space-y-8">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Profile Metadata */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-slate-950">Academic & Identity Profile</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900">Full Name</label>
                <Input
                  className="mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">College / Institution</label>
                <Input
                  className="mt-1"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. Campus University / IIT Delhi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Roll / Student ID</label>
                <Input
                  className="mt-1"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2024CS1042"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Branch / Specialization</label>
                <Input
                  className="mt-1"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Graduation / Passing Year</label>
                <Input
                  type="number"
                  className="mt-1"
                  value={passingYear}
                  onChange={(e) => setPassingYear(e.target.value)}
                  placeholder="e.g. 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Email Address (Read-only)</label>
                <Input
                  disabled
                  className="mt-1 bg-slate-100 font-mono text-slate-600"
                  value={user?.email ?? ""}
                />
              </div>
            </div>
          </div>

          {/* Interest Matching Preferences */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="text-rose-500" size={20} />
                <h2 className="text-lg font-bold text-slate-950">Campus Interests & Event Preferences</h2>
              </div>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {selectedInterests.length} Selected
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Select topics you care about. We will prioritize events matching your interests on your feed with <strong>✨ Personalized Match Badges</strong>!
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/events">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button className="gap-2 font-bold" disabled={isSaving} type="submit">
              <Save size={16} /> {isSaving ? "Saving..." : "Save Profile & Preferences"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
};
