import React from 'react';
import { Save } from 'lucide-react';

const FormInput = ({ label, value, onChange, type = 'text' }) => (
    <label className="block">
        <span className="mb-2 block text-sm font-semibold text-white">{label}</span>
        {type === 'textarea' ? (
            <textarea
                value={value || ''}
                onChange={onChange}
                className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
            />
        ) : (
            <input
                type={type}
                value={value || ''}
                onChange={onChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
            />
        )}
    </label>
);

const SaveButton = ({ onSave }) => (
    <button
        type="button"
        onClick={onSave}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
    >
        <Save className="h-4 w-4" />
        Save Changes
    </button>
);

export default function SiteSettingsEditor({ content, update, onSave }) {
    const fields = ['brandName', 'email', 'instagram', 'linkedin', 'youtube', 'github', 'copyright'];
    return (
        <div className="space-y-4">
            {fields.map((key) => (
                <FormInput
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1')}
                    value={content[key]}
                    onChange={(e) => update(draft => { draft[key] = e.target.value; })}
                />
            ))}
            <SaveButton onSave={onSave} />
        </div>
    );
}
