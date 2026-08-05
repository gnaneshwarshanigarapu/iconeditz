import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase'; // It's better to use the API but for now this is quicker
import { Plus, Edit, Trash } from 'lucide-react';

const fetchCollection = async (collectionName) => {
    const { data, error } = await supabase.from(collectionName).select('*');
    if (error) throw new Error(error.message);
    return data;
};

const upsertCollectionItem = async ({ collectionName, item }) => {
    const { data, error } = await supabase.from(collectionName).upsert(item).select();
    if (error) throw new Error(error.message);
    return data;
};

const deleteCollectionItem = async ({ collectionName, id }) => {
    const { error } = await supabase.from(collectionName).delete().eq('id', id);
    if (error) throw new Error(error.message);
};

const CollectionCms = ({ collectionName }) => {
    const queryClient = useQueryClient();
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: collection, isLoading, error } = useQuery({
        queryKey: ['collection', collectionName],
        queryFn: () => fetchCollection(collectionName),
    });

    const upsertMutation = useMutation({
        mutationFn: upsertCollectionItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['collection', collectionName]);
            setIsModalOpen(false);
            setEditingItem(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCollectionItem,
        onSuccess: () => {
            queryClient.invalidateQueries(['collection', collectionName]);
        },
    });

    const handleAddNew = () => {
        setEditingItem({});
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate({ collectionName, id });
        }
    };

    const handleSave = (item) => {
        upsertMutation.mutate({ collectionName, item });
    };
    
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const fields = collection.length > 0 ? Object.keys(collection[0]) : [];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold capitalize">{collectionName}</h1>
                <button onClick={handleAddNew} className="admin-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white/5 rounded-lg">
                    <thead>
                        <tr className="text-left text-white/80">
                            {fields.map(field => <th key={field} className="p-4">{field}</th>)}
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collection.map(item => (
                            <tr key={item.id} className="border-t border-white/10">
                                {fields.map(field => <td key={field} className="p-4">{JSON.stringify(item[field])}</td>)}
                                <td className="p-4">
                                    <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300 mr-2"><Edit/></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300"><Trash/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <CollectionFormModal
                    item={editingItem}
                    fields={fields}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

const CollectionFormModal = ({ item, fields, onSave, onClose }) => {
    const [formData, setFormData] = useState(item);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-gray-800 p-8 rounded-lg w-1/2">
                <h2 className="text-xl font-bold mb-4">Edit Item</h2>
                <form onSubmit={handleSubmit}>
                    {fields.filter(f => f !== 'id' && f !== 'created_at').map(field => (
                        <div key={field} className="mb-4">
                            <label className="block text-sm font-medium text-white/80 capitalize">{field}</label>
                            <input
                                type="text"
                                name={field}
                                value={formData[field] || ''}
                                onChange={handleChange}
                                className="admin-input mt-2"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="admin-button-secondary mr-2">Cancel</button>
                        <button type="submit" className="admin-button-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectionCms;
