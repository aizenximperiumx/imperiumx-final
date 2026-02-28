import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Tooltip from '../components/ui/Tooltip';
import Drawer from '../components/ui/Drawer';
import Toast from '../components/Toast';

export default function DesignSystem() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{message: string, type: 'success'|'error'|'warning'|'info'}|null>(null);
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">Design System</h1>
          <div className="text-gray-400">Tokens, components, and motion previews</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="lux-card lux-card-brand rounded-2xl p-6">
            <div className="text-xl font-bold mb-4">Buttons</div>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <button className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-180 ease-out-quint">Ghost</button>
              <button className="px-4 py-2 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-all duration-180 ease-out-quint">Danger</button>
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
              <Button onClick={() => setToast({ message: 'This is a toast', type: 'info' })}>Show Toast</Button>
            </div>
          </div>

          <div className="lux-card lux-card-brand rounded-2xl p-6">
            <div className="text-xl font-bold mb-4">Badges</div>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Tooltip label="Success badge">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold inline-block">Success</span>
              </Tooltip>
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold">Warning</span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold">Info</span>
            </div>
          </div>
        </div>

        <div className="lux-card lux-card-brand rounded-2xl p-6">
          <div className="text-xl font-bold mb-4">Cards & Inputs</div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="lux" color="brand">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Lux Card</div>
                <div className="text-xl font-bold">Glass panel</div>
              </div>
            </Card>
            <div>
              <Input label="Input" placeholder="Type here" />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Motion</div>
              <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all duration-180 ease-out-quint">Interactive</button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </>
        )}
      >
        <div className="text-gray-300">Reusable modal component with token styles.</div>
      </Modal>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer" side="right">
        <div className="space-y-3 text-gray-300">
          <div>Reusable drawer component for secondary flows.</div>
          <div>Responsive: use side="bottom" for mobile sheets.</div>
        </div>
      </Drawer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
