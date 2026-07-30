import { useState } from 'react';
import {
  User,
  Target,
  GraduationCap,
  Code,
  FolderOpen,
  Briefcase,
  Medal,
  Award,
  BookOpen,
  Globe,
  Heart,
  ArrowRight,
  Check,
} from 'lucide-react';
import { focusRing } from '../../theme/tokens';

const FIELD_META = {
  Header: { icon: User, hint: 'Contact details' },
  Objective: { icon: Target, hint: 'Career summary' },
  Education: { icon: GraduationCap, hint: 'Degrees' },
  'Technical Skills': { icon: Code, hint: 'Tools & stacks' },
  Projects: { icon: FolderOpen, hint: 'Work samples' },
  'Work Experience': { icon: Briefcase, hint: 'Roles & impact' },
  'Positions of Responsibility': { icon: Medal, hint: 'Leadership' },
  Certifications: { icon: Award, hint: 'Credentials' },
  Achievements: { icon: Medal, hint: 'Highlights' },
  'Research/Publications': { icon: BookOpen, hint: 'Writing' },
  Languages: { icon: Globe, hint: 'Spoken langs' },
  Hobbies: { icon: Heart, hint: 'Interests' },
};

const FieldSelection = ({ availableFields, onSelect }) => {
  const [selectedFields, setSelectedFields] = useState(['Header']);

  const handleFieldToggle = (field) => {
    if (field === 'Header') return;

    setSelectedFields((prev) => {
      if (prev.includes(field)) return prev.filter((f) => f !== field);
      if (prev.length < 7) return [...prev, field];
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFields.includes('Header') && selectedFields.length <= 7) {
      onSelect(selectedFields);
    }
  };

  const canSubmit =
    selectedFields.includes('Header') && selectedFields.length >= 1 && selectedFields.length <= 7;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableFields.map((field) => {
          const meta = FIELD_META[field] || { icon: Briefcase, hint: '' };
          const Icon = meta.icon;
          const isSelected = selectedFields.includes(field);
          const isMandatory = field === 'Header';
          const isDisabled = !isSelected && selectedFields.length >= 7;

          return (
            <li key={field}>
              <button
                type="button"
                disabled={isDisabled || isMandatory}
                onClick={() => handleFieldToggle(field)}
                aria-pressed={isSelected}
                className={`flex h-full w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition ${focusRing} ${
                  isSelected
                    ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]'
                    : isDisabled
                      ? 'cursor-not-allowed border-[#E5DCCE] bg-[#FFFDF8]/50 opacity-45'
                      : 'border-[#E5DCCE] bg-[#FFFDF8] hover:border-[#C4A574]/70'
                } ${isMandatory && isSelected ? 'cursor-default' : ''}`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    isSelected
                      ? 'border-[#C4A574] bg-[#C4A574]/20 text-[#C4A574]'
                      : 'border-[#E5DCCE] bg-[#F7F3EC]'
                  }`}
                  aria-hidden
                >
                  {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-[#C4A574]' : 'text-[#6B5A48]'}`}
                    />
                    <span
                      className={`truncate text-sm font-medium ${isSelected ? 'text-[#FFFDF8]' : 'text-[#1C1917]'}`}
                    >
                      {field}
                    </span>
                  </span>
                  <span
                    className={`mt-1 block text-[11px] leading-snug ${isSelected ? 'text-[#E5DCCE]' : 'text-[#78716C]'}`}
                  >
                    {isMandatory ? 'Required · ' : ''}
                    {meta.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Sticky action bar — always reachable without scrolling to bottom */}
      <div className="sticky bottom-4 z-20 mt-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]/95 px-4 py-3 shadow-[0_12px_40px_-20px_rgba(44,36,27,0.35)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-[#57534E]">
            <span className="font-semibold tabular-nums text-[#1C1917]">{selectedFields.length}</span>
            <span className="text-[#78716C]"> / 7 selected</span>
            {selectedFields.length >= 7 && (
              <span className="ml-2 text-[#6B5A48]">· Max reached</span>
            )}
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${focusRing} ${
              canSubmit
                ? 'bg-[#2C241B] text-[#FFFDF8] hover:bg-[#1A1510]'
                : 'cursor-not-allowed bg-[#E5DCCE] text-[#78716C]'
            }`}
          >
            Continue to editor
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default FieldSelection;
