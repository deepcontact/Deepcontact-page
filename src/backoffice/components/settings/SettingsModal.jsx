import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Btn from "../ui/Btn";

export default function SettingsModal({ open, onClose, config, onSave }) {
  const [local, setLocal] = useState(config);
  return (
    <Modal open={open} onClose={onClose} title="Configuración" subtitle="Credenciales de conexión del sistema">
      <Input label="URL del servidor" placeholder="https://xxxx.supabase.co" value={local.url} onChange={(e) => setLocal({ ...local, url: e.target.value })} />
      <Input label="Clave de acceso" placeholder="eyJhbGciOiJIUzI1NiIs..." type="password" value={local.key} onChange={(e) => setLocal({ ...local, key: e.target.value })} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => { onSave(local); onClose(); }}>Guardar cambios</Btn>
      </div>
    </Modal>
  );
}
