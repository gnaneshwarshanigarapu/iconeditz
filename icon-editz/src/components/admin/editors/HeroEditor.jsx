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

export default function HeroEditor({ content, update, onSave }) {
    const fields = [
        { key: 'heading', label: 'Heading', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'primaryCta', label: 'Primary CTA Text', type: 'text' },
        { key: 'secondaryCta', label: 'Secondary CTA Text', type: 'text' },
    ];
    return (
        <div className="space-y-4">
            {fields.map(field => (
                <FormInput
                    key={field.key}
                    label={field.label}
                    value={content[field.key]}
                    onChange={e => update(draft => { draft[field.key] = e.target.value; })}
                    type={field.type}
                />
            ))}
            <FormInput
                label="Badges (one per line)"
                type="textarea"
                value={(content.badges || []).join('\n')}
                onChange={e => update(draft => { draft.badges = e.target.value.split('\n').filter(Boolean); })}
            />
            <SaveButton onSave={onSave} />
        </div>
    );
};
