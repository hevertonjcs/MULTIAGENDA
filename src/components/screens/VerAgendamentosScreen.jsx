
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Card } from "../ui/card";

const formatPhone = (numero) => {
  let clean = numero.replace(/\D/g, "");
  if (clean.startsWith("55")) return clean;
  if (clean.length === 11) return `55${clean}`;
  return `55${clean}`;
};

const openWhatsapp = (numero, dataAgendamento, horaAgendamento) => {
  const telefone = formatPhone(numero);
  const dataFormatada = new Date(dataAgendamento).toLocaleDateString("pt-BR").slice(0, 5);
  const horaFormatada = horaAgendamento.split(":")[0];
  const msg = `Olá, Vi aqui no sistema que você possui uma visita agendada conosco para a data ${dataFormatada} e por volta das ${horaFormatada} horas.`;
  const link = `https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`;
  window.open(link, "_blank");
};

const VerAgendamentosScreen = () => {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("agendamentos").select("*").order("data", { ascending: false });
      if (!error) setAgendamentos(data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Agendamentos</h2>
      {agendamentos.map((item) => (
        <Card key={item.id} className="p-4 mb-4">
          <p><strong>{item.nome}</strong></p>
          <p>📅 {new Date(item.data).toLocaleDateString("pt-BR")}, {item.horario}</p>
          <p>👤 Vendedor: {item.vendedor}</p>
          <p><strong>Interesse:</strong> {item.interesse}</p>
          <p><strong>Contato:</strong> {item.telefone}</p>
          {item.entrada && <p><strong>Entrada:</strong> R$ {item.entrada.toLocaleString("pt-BR")}</p>}
          {item.obs && <p><strong>Obs:</strong> {item.obs}</p>}
          <button
            onClick={() => openWhatsapp(item.telefone, item.data, item.horario)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded mt-2"
          >
            Enviar WhatsApp
          </button>
        </Card>
      ))}
    </div>
  );
};

export default VerAgendamentosScreen;
