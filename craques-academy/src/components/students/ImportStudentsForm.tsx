import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload } from "lucide-react";
import * as XLSX from 'xlsx';
import { Student } from "./StudentForm";

interface ImportStudentsFormProps {
  open: boolean;
  onClose: () => void;
  onImport: (students: Omit<Student, 'id'>[]) => void;
}

export function ImportStudentsForm({
  open,
  onClose,
  onImport,
}: ImportStudentsFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "Nome do Atleta",
        birthDate: "Data de Nascimento (YYYY-MM-DD)",
        rg: "RG",
        cpf: "CPF",
        category: "Categoria (Sub-7, Sub-9, Sub-11, Sub-13, Sub-15, Sub-17)",
        joinDate: "Data de Início (YYYY-MM-DD)",
        polo: "Polo",
        status: "Status (Ativo, Inativo, Pagamento Pendente)",
        responsibleName: "Nome do Responsável",
        responsibleCpf: "CPF do Responsável",
        whatsapp: "WhatsApp",
        address: "Endereço",
        position: "Posição",
        phone: "Telefone",
        hasScholarship: "Bolsa (true/false)",
        scholarshipDiscount: "Desconto da Bolsa (%)"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_importacao_alunos.xlsx");
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const students = jsonData.map((row: any) => ({
          name: row.name || "",
          birthDate: row.birthDate || "",
          rg: row.rg || "",
          cpf: row.cpf || "",
          category: row.category || "",
          joinDate: row.joinDate || new Date().toISOString().split('T')[0],
          polo: row.polo || "",
          status: row.status || "Ativo",
          responsibleName: row.responsibleName || "",
          responsibleCpf: row.responsibleCpf || "",
          whatsapp: row.whatsapp || "",
          address: row.address || "",
          position: row.position || "",
          phone: row.phone || "",
          hasScholarship: row.hasScholarship === "true",
          scholarshipDiscount: row.scholarshipDiscount ? Number(row.scholarshipDiscount) : 0,
          age: 0 // Será calculado automaticamente
        }));

        onImport(students);
        toast({
          title: "Sucesso",
          description: `${students.length} alunos importados com sucesso.`,
        });
        onClose();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar o arquivo. Verifique se o formato está correto.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Alunos</DialogTitle>
          <DialogDescription>
            Importe uma lista de alunos através de um arquivo Excel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Template
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 