function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
}

export async function startRazorpayPayment({ claimId, paymentType, amount, user, onSuccess, onFailure }) {
  try {
    await loadRazorpayScript();

    const orderRes = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimId, paymentType, amount }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      throw new Error(err.error || 'Could not create payment order');
    }

    const { orderId, amountPaise, keyId, transactionId } = await orderRes.json();

    const rzp = new window.Razorpay({
      key: keyId,
      amount: amountPaise,
      currency: 'INR',
      name: 'UMANG',
      description: paymentType === 'assistance_fee' ? 'Claim Assistance Fee' : 'Success Fee',
      order_id: orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: { claimId, paymentType, transactionId },
      theme: { color: '#1b4332' },
      handler: function (response) {
        fetch('/api/verify-razorpay-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.verified) {
              onSuccess?.({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id });
            } else {
              onFailure?.(new Error('Payment could not be verified'));
            }
          })
          .catch((e) => onFailure?.(e));
      },
      modal: {
        ondismiss: function () {
          onFailure?.(new Error('Payment cancelled by user'));
        },
      },
    });

    rzp.on('payment.failed', function (response) {
      onFailure?.(new Error(response.error?.description || 'Payment failed'));
    });

    rzp.open();
  } catch (err) {
    onFailure?.(err);
  }
}