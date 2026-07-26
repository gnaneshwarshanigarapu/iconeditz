import React from 'react'
import AdminLayout from '../../layouts/AdminLayout'

export default function ProductManager() {
  return (
    <AdminLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold">Product Manager</h1>
        <p className="mt-4 text-text-muted">Create, edit and manage products here.</p>
      </div>
    </AdminLayout>
  )
}
