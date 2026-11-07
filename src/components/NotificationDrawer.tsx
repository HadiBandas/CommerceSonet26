import React from 'react';
import { useApp } from '../context/AppContext';
import { X, MessageSquare, ExternalLink, CheckCheck, Trash2, Smartphone } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const {
    notifications,
    dismissNotification,
    setActiveRole,
    setActiveCourierToken,
    setSelectedOrderId,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                Simulasi WhatsApp Business
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded-full font-normal">
                  FR-B5 & FR-G1
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Pesan otomatis ke UMKM, Kurir & Pelanggan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white transition"
            aria-label="Tutup notifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Di Fase 0, UMKM & kurir tidak wajib buka aplikasi. Tautan aksi di WhatsApp langsung
            membuka portal/link web khusus.
          </span>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Belum ada pesan WhatsApp yang masuk.
            </div>
          ) : (
            notifications.map((n) => {
              const roleBadgeColor = {
                merchant: 'bg-amber-100 text-amber-800 border-amber-200',
                customer: 'bg-blue-100 text-blue-800 border-blue-200',
                courier: 'bg-purple-100 text-purple-800 border-purple-200',
                ops: 'bg-rose-100 text-rose-800 border-rose-200',
              }[n.recipient];

              return (
                <div
                  key={n.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:shadow-xs transition space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadgeColor}`}
                      >
                        {n.recipient.toUpperCase()}: {n.recipientName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-mono">{n.phone}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                        title="Hapus pesan"
                        aria-label="Hapus pesan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {n.actionText && (
                        <button
                          onClick={() => {
                            if (n.recipient === 'merchant') {
                              setActiveRole('merchant');
                            } else if (n.recipient === 'courier') {
                              setActiveRole('courier');
                            } else if (n.recipient === 'ops') {
                              setActiveRole('ops');
                            } else {
                              onSelectOrder(n.title.match(/#([A-Z0-9-]+)/)?.[1] || '');
                            }
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-md transition"
                        >
                          <span>{n.actionText}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
