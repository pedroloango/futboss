import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import { useDbPayments } from "@/hooks/useDbPayments";
import { supabase } from '@/lib/supabaseClient';
import { useStudents } from '@/hooks/useStudents';
import { PaymentStats } from "@/components/payments/PaymentStats";
import { PaymentFilters } from "@/components/payments/PaymentFilters";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PixQRCode } from "@/components/payments/PixQRCode";
import { ReceiptDialog } from "@/components/payments/ReceiptDialog";
import { PaymentDetails } from "@/components/payments/PaymentDetails";
import { Payment } from "@/types/payment";
import { toast } from "@/components/ui/use-toast";

const Mensalidades = () => {
  const {
    data: payments = [],
    isLoading: isPaymentsLoading,
    createPayment,
    updatePayment,
    deletePayment,
    refetch: refetchPayments,
  } = useDbPayments();

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");

  const categories = useMemo(() => Array.from(new Set(payments.map(p => p.category))), [payments]);
  const paymentTypes = useMemo(() => Array.from(new Set(payments.map(p => p.paymentType))), [payments]);

  useEffect(() => {
    let result = payments;
    if (searchTerm) result = result.filter(p => p.student.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    if (monthFilter) result = result.filter(p => p.month === monthFilter);
    if (paymentTypeFilter) result = result.filter(p => p.paymentType === paymentTypeFilter);
    if (
      result.length !== filteredPayments.length ||
      result.some((p, i) => p.id !== filteredPayments[i]?.id)
    ) {
      setFilteredPayments(result);
    }
  }, [payments, searchTerm, statusFilter, categoryFilter, monthFilter, paymentTypeFilter]);

  const handleGenerateAllPayments = async () => {
    await supabase.rpc('generate_payments_for_active_students', { p_year: new Date().getFullYear() });
    await refetchPayments();
  };

  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isPixQRCodeOpen, setIsPixQRCodeOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { data: students = [] } = useStudents();

  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  const [paymentToConfirm, setPaymentToConfirm] = useState<Payment | null>(null);

  const handleConfirmPayment = (payment: Payment) => {
    setPaymentToConfirm(payment);
    setIsConfirmPaymentOpen(true);
  };

  const handleSaveConfirmedPayment = async (payment: Payment) => {
    try {
      const updatedPayment = {
        ...payment,
        status: "Pago" as const,
        paymentDate: new Date().toLocaleDateString("pt-BR"),
        paymentType: "Mensalidade",
      };
      await updatePayment.mutateAsync(updatedPayment);
      setSelectedPayment(updatedPayment);
      setIsReceiptDialogOpen(true);
      toast({
        title: "Pagamento confirmado",
        description: `O pagamento de ${payment.student} foi confirmado com sucesso.`,
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Não foi possível confirmar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmPaymentOpen(false);
      setPaymentToConfirm(null);
    }
  };

  const handleMarkPending = async (payment: Payment) => {
    try {
      const updatedPayment = {
        ...payment,
        status: "Pendente" as const,
        paymentDate: undefined,
      };
      await updatePayment.mutateAsync(updatedPayment);
      toast({
        title: "Status alterado",
        description: `O pagamento de ${payment.student} voltou para pendente.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    try {
      await deletePayment.mutateAsync(payment.id);
      toast({
        title: "Pagamento excluído",
        description: `O pagamento de ${payment.student} foi excluído.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir pagamento",
        description: "Não foi possível excluir o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Mensalidades</h2>
            <p className="text-muted-foreground">
              Gerencie os pagamentos e mensalidades
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={handleGenerateAllPayments}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Gerar Mensalidades
            </Button>
            <Button 
              className="bg-football-green hover:bg-football-dark-green"
              onClick={() => {
                setSelectedPayment(null);
                setIsPaymentFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Outros Pagamentos
            </Button>
          </div>
        </div>

        <PaymentStats payments={filteredPayments.length > 0 || searchTerm || statusFilter || monthFilter || categoryFilter ? filteredPayments : payments} />

        <PaymentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          monthFilter={monthFilter}
          onMonthFilterChange={setMonthFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          paymentTypeFilter={paymentTypeFilter}
          onPaymentTypeFilterChange={setPaymentTypeFilter}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("");
            setMonthFilter("");
            setCategoryFilter("");
            setPaymentTypeFilter("");
          }}
          categories={categories}
          paymentTypes={paymentTypes}
        />

        <PaymentsTable
          payments={filteredPayments}
          onConfirmPayment={handleConfirmPayment}
          onGeneratePix={(payment) => {
            setSelectedPayment(payment);
            setIsPixQRCodeOpen(true);
          }}
          onViewReceipt={(payment) => {
            setSelectedPayment(payment);
            setIsReceiptDialogOpen(true);
          }}
          onViewDetails={(payment) => {
            setSelectedPayment(payment);
            setIsPaymentDetailsOpen(true);
          }}
          onMarkPending={handleMarkPending}
          onDeletePayment={handleDeletePayment}
        />
      </div>

      <PaymentForm
        open={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSave={(payment) => {
          const { id, ...data } = payment;
          if (selectedPayment) {
            updatePayment.mutate(payment, {
              onSuccess: () => {
                setSelectedPayment(payment);
                setIsReceiptDialogOpen(true);
                setIsPaymentFormOpen(false);
              },
            });
          } else {
            createPayment.mutate(data as Omit<Payment, 'id'>, {
              onSuccess: () => {
                setSelectedPayment(payment);
                setIsReceiptDialogOpen(true);
                setIsPaymentFormOpen(false);
              },
            });
          }
        }}
        initialData={selectedPayment || undefined}
        studentsList={students}
        formTitle="Outros Pagamentos"
        allowedPaymentTypeNames={["Uniforme", "Matrícula", "Taxa de inscrição"]}
        defaultStatus="Pago"
      />

      <PixQRCode
        open={isPixQRCodeOpen}
        onClose={() => setIsPixQRCodeOpen(false)}
        payment={selectedPayment}
      />

      <ReceiptDialog
        open={isReceiptDialogOpen}
        onClose={() => setIsReceiptDialogOpen(false)}
        payment={selectedPayment}
      />

      <PaymentDetails
        open={isPaymentDetailsOpen}
        onClose={() => setIsPaymentDetailsOpen(false)}
        payment={selectedPayment}
      />

      <PaymentForm
        open={isConfirmPaymentOpen}
        onClose={() => {
          setIsConfirmPaymentOpen(false);
          setPaymentToConfirm(null);
        }}
        onSave={handleSaveConfirmedPayment}
        initialData={paymentToConfirm || undefined}
        studentsList={students}
        formTitle="Confirmar Pagamento"
      />
    </MainLayout>
  );
};

export default Mensalidades;
