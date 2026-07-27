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

export default function FaqEditor({ content, update, onSave }) {
    return (
        <div className="space-y-4">
            {(content.items || []).map((item, index) => (
                <div key={index} className="rounded-lg border border-white/10 p-3">
                    <FormInput
                        label="Question"
                        value={item.question}
                        onChange={e => update(draft => { draft.items[index].question = e.target.value; })}
                    />
                    <FormInput
                        label="Answer"
                        type="textarea"
                        value={item.answer}
                        onChange={e => update(draft => { draft.items[index].answer = e.target.value; })}
                    />
                </div>
            ))}
            <SaveButton onSave={onSave} />
        </div>
    );
}
