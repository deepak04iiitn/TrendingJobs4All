import { focusRing } from '../../theme/tokens';

export default function AuthField({
  id,
  label,
  type = 'text',
  placeholder,
  onChange,
  autoComplete,
  required = true,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#57534E]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`auth-input w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-4 py-3 text-[#1C1917] placeholder:text-[#78716C] ${focusRing}`}
      />
    </div>
  );
}
