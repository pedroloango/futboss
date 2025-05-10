import { Payment } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, MoreVertical, QrCode, FileText, Info } from "lucide-react";
import { useState } from "react";

interface PaymentsTableProps {
  payments: Payment[];
  onConfirmPayment: (payment: Payment) => void;
  onGeneratePix: (payment: Payment) => void;
  onViewReceipt: (payment: Payment) => void;
  onViewDetails: (payment: Payment) => void;
  onMarkPending: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
}

export const PaymentsTable = ({
  payments,
  onConfirmPayment,
  onGeneratePix,
  onViewReceipt,
  onViewDetails,
  onMarkPending,
  onDeletePayment,
}: PaymentsTableProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 30;
  const totalPages = Math.ceil(payments.length / pageSize);
  const paginatedPayments = payments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Mês</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Tipo de Pagamento</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPayments.length > 0 ? (
            paginatedPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {payment.student
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{payment.student}</span>
                  </div>
                </TableCell>
                <TableCell>{payment.category}</TableCell>
                <TableCell>{payment.month}</TableCell>
                <TableCell>{payment.value}</TableCell>
                <TableCell>{payment.dueDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "Pago" 
                        ? "default" 
                        : payment.status === "Atrasado" 
                          ? "destructive" 
                          : "outline"
                    }
                    className={
                      payment.status === "Pago"
                        ? "bg-football-green hover:bg-football-dark-green"
                        : payment.status === "Pendente"
                          ? "text-amber-500 border-amber-500"
                          : ""
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>{payment.paymentType}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {payment.status !== "Pago" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onConfirmPayment(payment)}
                        title="Confirmar Pagamento"
                      >
                        <Check className="h-4 w-4 text-football-green" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onGeneratePix(payment)}>
                          <QrCode className="mr-2 h-4 w-4" /> Gerar PIX
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewReceipt(payment)}>
                          <FileText className="mr-2 h-4 w-4" /> Recibo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                          <Info className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>
                        {payment.status === "Pago" && (
                          <DropdownMenuItem onClick={() => onMarkPending(payment)}>
                            <Check className="mr-2 h-4 w-4 text-amber-500" /> Voltar para Pendente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDeletePayment(payment)} className="text-red-600">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                Nenhum pagamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
};
