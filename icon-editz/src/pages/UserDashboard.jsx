import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { createSignedDownloadUrl, getUserDownloads, getUserOrders, getUserWishlist, updateUserProfile } from '../utils/supabase'

const tabs = [
  { id: 'purchases', label: 'My Purchases' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'orders', label: 'Order History' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'profile', label: 'Profile Settings' },
]

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('purchases')
  const [orders, setOrders] = useState([])
  const [downloads, setDownloads] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [profileName, setProfileName] = useState(user?.user_metadata?.full_name || '')
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      setLoading(true)
      try {
        const [ordersData, downloadsData, wishlistData] = await Promise.all([
          getUserOrders(user.id),
          getUserDownloads(user.id),
          getUserWishlist(user.id),
        ])

        setOrders(ordersData || [])
        setDownloads(downloadsData || [])
        setWishlist(wishlistData || [])
      } catch (error) {
        console.error('User dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleDownload = async (filePath) => {
    if (!filePath) return
    try {
      const url = await createSignedDownloadUrl(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET, filePath)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Download URL error:', error)
      setStatusMessage('Unable to generate secure download link. Please try again later.')
    }
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    setStatusMessage('')

    try {
      await updateUserProfile({ full_name: profileName })
      setStatusMessage('Profile settings saved successfully.')
    } catch (error) {
      console.error('Profile save error:', error)
      setStatusMessage('Unable to save profile settings right now.')
    } finally {
      setSavingProfile(false)
    }
  }

  const stats = useMemo(
    () => ({
      purchases: orders.length,
      downloads: downloads.length,
      orders: orders.length,
      wishlist: wishlist.length,
    }),
    [orders, downloads, wishlist],
  )

  return (
    <div className="min-h-screen bg-background text-text px-4 py-24 md:px-8">
      <div className="container-custom space-y-8">
        <header className="rounded-[2rem] border border-primary/10 bg-surface/95 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary">Account dashboard</p>
              <h1 className="mt-3 text-4xl font-bold">Welcome back, {user?.user_metadata?.full_name || 'Creator'}</h1>
              <p className="mt-3 max-w-2xl text-text-muted">Manage your purchases, access downloads, and review order history from one place.</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-primary/10 bg-background/90 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] border border-primary/10 bg-surface/95 p-6 shadow-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                <p className="text-sm text-text-muted">Total purchases</p>
                <p className="mt-3 text-3xl font-semibold">{stats.purchases}</p>
              </div>
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                <p className="text-sm text-text-muted">Download items</p>
                <p className="mt-3 text-3xl font-semibold">{stats.downloads}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                <p className="text-sm text-text-muted">Order history</p>
                <p className="mt-3 text-3xl font-semibold">{stats.orders}</p>
              </div>
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                <p className="text-sm text-text-muted">Wishlist</p>
                <p className="mt-3 text-3xl font-semibold">{stats.wishlist}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/10 bg-surface/95 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-primary">Account overview</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-4">
                <p className="text-sm text-text-muted">Email</p>
                <p className="mt-1 font-semibold">{user?.email}</p>
              </div>
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-4">
                <p className="text-sm text-text-muted">Email verified</p>
                <p className="mt-1 font-semibold">{user?.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
              <div className="rounded-3xl border border-primary/10 bg-background/90 p-4">
                <p className="text-sm text-text-muted">User ID</p>
                <p className="mt-1 break-all text-sm">{user?.id}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[2rem] border border-primary/10 bg-surface/95 p-6 shadow-xl">
          <div className="mb-6 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'border border-primary/10 bg-background/80 text-text-muted hover:border-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {statusMessage && (
            <div className="mb-6 rounded-3xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {statusMessage}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-primary/10 bg-background/90 p-8 text-center text-text-muted">Loading your dashboard…</div>
          ) : (
            <div>
              {activeTab === 'purchases' && (
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{order.product_name || order.product_title || 'Purchased product'}</p>
                            <p className="text-sm text-text-muted">Invoice #{order.invoice_number || order.id}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(order.product_file_path || order.file_path)}
                            className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm text-primary transition hover:bg-primary/10"
                          >
                            Download again
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-primary/10 bg-background/90 p-8 text-text-muted">No purchases yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'downloads' && (
                <div className="space-y-4">
                  {downloads.length > 0 ? (
                    downloads.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{item.product_name || item.title || 'Downloaded item'}</p>
                            <p className="text-sm text-text-muted">Downloaded on {new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(item.download_path || item.product_file_path || item.file_path)}
                            className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm text-primary transition hover:bg-primary/10"
                          >
                            Download file
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-primary/10 bg-background/90 p-8 text-text-muted">No download history available.</div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <p className="font-semibold">{order.product_name || order.product_title || 'Order item'}</p>
                            <p className="text-sm text-text-muted">Invoice #{order.invoice_number || order.id}</p>
                            <p className="text-sm text-text-muted">Amount: ${Number(order.amount ?? 0).toFixed(2)}</p>
                          </div>
                          <p className="rounded-full bg-background/80 px-4 py-2 text-sm text-text-muted">{order.status || 'Completed'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-primary/10 bg-background/90 p-8 text-text-muted">No orders have been placed yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  {wishlist.length > 0 ? (
                    wishlist.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-primary/10 bg-background/90 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{item.product_name || item.title || 'Wishlist item'}</p>
                            <p className="text-sm text-text-muted">Added {new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                          <button
                            type="button"
                            className="rounded-full border border-primary/15 bg-background/80 px-4 py-2 text-sm text-text-muted transition hover:border-primary"
                          >
                            View product
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-primary/10 bg-background/90 p-8 text-text-muted">Your wishlist is empty.</div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <form className="space-y-5" onSubmit={handleProfileSave}>
                    <label className="space-y-2 text-sm text-text-muted">
                      Full name
                      <input
                        type="text"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                        placeholder="Your full name"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-text-muted">
                      Email address
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text/80 outline-none"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-3xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingProfile ? 'Saving…' : 'Save profile'}
                    </button>
                  </form>
                  <p className="text-sm text-text-muted">If you change your email address, use your account settings in Supabase or contact support to update it.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
