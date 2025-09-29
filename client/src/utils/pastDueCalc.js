export const getPastDue = async (backend, id) => {
  let previousInvoices = await backend.get(`/invoices/previousInvoices/${id}`);
  previousInvoices = previousInvoices.data;

  const previousTotals = await Promise.all(
    previousInvoices.map(async (invoice) => {
      const total = await backend.get(`/invoices/total/${invoice.id}`);
      return total.data.total;
    })
  );
  const previousTotal = previousTotals.reduce((acc, total) => acc + total, 0);

  const paidTotals = await Promise.all(
    previousInvoices.map(async (invoice) => {
      const paid = await backend.get(`/invoices/paid/${invoice.id}`);
      return paid.data.total;
    })
  );
  const paidTotal = paidTotals.reduce((acc, paid) => acc + paid, 0);

  const pastDue = (previousTotal - paidTotal) > 0 ? (previousTotal - paidTotal) : 0;
  return pastDue;
};


export const getAllDue = async (backend, id) => {
    let previousInvoices = await backend.get(`/invoices/previousInvoices/${id}`);
    previousInvoices = previousInvoices.data;

    const previousTotals = await Promise.all(
        previousInvoices.map(async (invoice) => {
        const total = await backend.get(`/invoices/total/${invoice.id}`);
        return total.data.total;
        })
    );
    let previousTotal = previousTotals.reduce((acc, total) => acc + total, 0);

    const currentTotal = await backend.get(`/invoices/total/${id}`);
    previousTotal = currentTotal.data.total;

    const paidTotals = await Promise.all(
        previousInvoices.map(async (invoice) => {
        const paid = await backend.get(`/invoices/paid/${invoice.id}`);
        return paid.data.total;
        })
    );
    let paidTotal = paidTotals.reduce((acc, paid) => acc + paid, 0);

    const currentPaid = await backend.get(`/invoices/paid/${id}`);
    paidTotal = currentPaid.data.total;

    const pastDue = (previousTotal - paidTotal) > 0 ? (previousTotal - paidTotal) : 0;
    return pastDue;
};