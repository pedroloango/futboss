import { toast } from "react-hot-toast";
import { useMutation } from "react-query";

const handleImportStudents = (importedStudents: Omit<Student, 'id'>[]) => {
  // Validação básica: nome e categoria obrigatórios
  const validStudents = importedStudents.filter(s => s.name && s.category);
  if (validStudents.length !== importedStudents.length) {
    toast({
      title: "Atenção",
      description: `Alguns alunos foram ignorados por falta de nome ou categoria. Importados: ${validStudents.length}/${importedStudents.length}`,
      variant: "destructive",
    });
  }
  console.log("Enviando alunos para o backend:", validStudents);
  validStudents.forEach(student => {
    createStudent.mutate(student, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Alunos importados com sucesso." });
      },
      onError: (error) => {
        toast({ title: "Erro ao importar aluno", description: String(error), variant: "destructive" });
      }
    });
  });
}; 