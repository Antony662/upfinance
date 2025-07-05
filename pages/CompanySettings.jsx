import React, { useState, useEffect } from "react";
import { Company } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Upload, Save } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function CompanySettingsPage() {
  const [company, setCompany] = useState({
    name: "",
    legal_name: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "",
    website: "",
    logo_url: "",
    bank_info: "",
    additional_info: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const companies = await Company.list();
      if (companies.length > 0) {
        setCompany(companies[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da empresa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await UploadFile({ file });
      setCompany(prev => ({
        ...prev,
        logo_url: file_url
      }));
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
      alert("Erro ao fazer upload do logo. Tente novamente.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const companies = await Company.list();
      if (companies.length > 0) {
        await Company.update(companies[0].id, company);
      } else {
        await Company.create(company);
      }
      alert("Dados da empresa salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados da empresa:", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="text-center py-16">Carregando dados da empresa...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configurações da Empresa</h1>
            <p className="text-slate-600 mt-1">Configure os dados que aparecerão nos seus orçamentos e documentos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Logo da Empresa */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Logo da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.logo_url ? (
                <div className="text-center">
                  <img 
                    src={company.logo_url} 
                    alt="Logo da empresa" 
                    className="max-w-full h-32 object-contain mx-auto mb-4 border rounded"
                  />
                  <p className="text-sm text-slate-500">Logo atual</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Nenhum logo cadastrado</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="logo">Alterar Logo</Label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700"
                  disabled={uploadingLogo}
                />
                {uploadingLogo && (
                  <p className="text-sm text-blue-600 mt-2">Fazendo upload...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dados Principais */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Fantasia *</Label>
                  <Input
                    id="name"
                    value={company.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Minha Empresa Ltda"
                  />
                </div>
                <div>
                  <Label htmlFor="legal_name">Razão Social</Label>
                  <Input
                    id="legal_name"
                    value={company.legal_name}
                    onChange={(e) => handleInputChange("legal_name", e.target.value)}
                    placeholder="Ex: Minha Empresa Limitada"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={company.cnpj}
                    onChange={(e) => handleInputChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={company.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={company.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contato@minhaempresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={company.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="www.minhaempresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Endereço */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Endereço Completo *</Label>
              <Input
                id="address"
                value={company.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Rua das Flores, 123 - Centro"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={company.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={company.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="SP"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={company.zip_code}
                  onChange={(e) => handleInputChange("zip_code", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bank_info">Dados Bancários</Label>
              <Textarea
                id="bank_info"
                value={company.bank_info}
                onChange={(e) => handleInputChange("bank_info", e.target.value)}
                placeholder="Banco: Nubank&#10;Agência: 0001&#10;Conta: 12345678-9&#10;Chave PIX: seuemail@email.com"
                rows={4}
              />
              <p className="text-sm text-slate-500 mt-1">
                Essas informações aparecerão nos orçamentos para facilitar o pagamento.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="additional_info">Observações</Label>
              <Textarea
                id="additional_info"
                value={company.additional_info}
                onChange={(e) => handleInputChange("additional_info", e.target.value)}
                placeholder="Informações extras que aparecerão no rodapé dos orçamentos..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}