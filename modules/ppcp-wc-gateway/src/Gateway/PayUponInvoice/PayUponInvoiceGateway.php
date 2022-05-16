<?php
/**
 * The Pay upon invoice Gateway
 *
 * @package WooCommerce\PayPalCommerce\WcGateway\Gateway
 */

declare(strict_types=1);

namespace WooCommerce\PayPalCommerce\WcGateway\Gateway\PayUponInvoice;

use Psr\Log\LoggerInterface;
use RuntimeException;
use WC_Order;
use WC_Order_Item_Product;
use WC_Payment_Gateway;
use WC_Product;
use WooCommerce\PayPalCommerce\ApiClient\Endpoint\PayUponInvoiceOrderEndpoint;
use WooCommerce\PayPalCommerce\ApiClient\Exception\PayPalApiException;
use WooCommerce\PayPalCommerce\ApiClient\Factory\PurchaseUnitFactory;
use WooCommerce\PayPalCommerce\Onboarding\Environment;
use WooCommerce\PayPalCommerce\WcGateway\Gateway\TransactionUrlProvider;
use WooCommerce\PayPalCommerce\WcGateway\Helper\PayUponInvoiceHelper;
use WooCommerce\PayPalCommerce\WcGateway\Processor\OrderMetaTrait;

/**
 * Class PayUponInvoiceGateway.
 */
class PayUponInvoiceGateway extends WC_Payment_Gateway {

	use OrderMetaTrait;

	const ID = 'ppcp-pay-upon-invoice-gateway';

	/**
	 * The order endpoint.
	 *
	 * @var PayUponInvoiceOrderEndpoint
	 */
	protected $order_endpoint;

	/**
	 * The purchase unit factory.
	 *
	 * @var PurchaseUnitFactory
	 */
	protected $purchase_unit_factory;

	/**
	 * The payment source factory.
	 *
	 * @var PaymentSourceFactory
	 */
	protected $payment_source_factory;

	/**
	 * The environment.
	 *
	 * @var Environment
	 */
	protected $environment;

	/**
	 * The transaction url provider.
	 *
	 * @var TransactionUrlProvider
	 */
	protected $transaction_url_provider;

	/**
	 * The logger interface.
	 *
	 * @var LoggerInterface
	 */
	protected $logger;

	/**
	 * The PUI helper.
	 *
	 * @var PayUponInvoiceHelper
	 */
	protected $pui_helper;

	/**
	 * PayUponInvoiceGateway constructor.
	 *
	 * @param PayUponInvoiceOrderEndpoint $order_endpoint The order endpoint.
	 * @param PurchaseUnitFactory         $purchase_unit_factory The purchase unit factory.
	 * @param PaymentSourceFactory        $payment_source_factory The payment source factory.
	 * @param Environment                 $environment The environment.
	 * @param TransactionUrlProvider      $transaction_url_provider The transaction URL provider.
	 * @param LoggerInterface             $logger The logger.
	 * @param PayUponInvoiceHelper        $pui_helper The PUI helper.
	 */
	public function __construct(
		PayUponInvoiceOrderEndpoint $order_endpoint,
		PurchaseUnitFactory $purchase_unit_factory,
		PaymentSourceFactory $payment_source_factory,
		Environment $environment,
		TransactionUrlProvider $transaction_url_provider,
		LoggerInterface $logger,
		PayUponInvoiceHelper $pui_helper
	) {
		$this->id = self::ID;

		$this->method_title       = __( 'Pay Upon Invoice', 'woocommerce-paypal-payments' );
		$this->method_description = __( 'Pay upon Invoice is an invoice payment method in Germany. It is a local buy now, pay later payment method that allows the buyer to place an order, receive the goods, try them, verify they are in good order, and then pay the invoice within 30 days.', 'woocommerce-paypal-payments' );

		$gateway_settings  = get_option( 'woocommerce_ppcp-pay-upon-invoice-gateway_settings' );
		$this->title       = $gateway_settings['title'] ?? $this->method_title;
		$this->description = $gateway_settings['description'] ?? __( 'Once you place an order, pay within 30 days. Our payment partner Ratepay will send you payment instructions.', 'woocommerce-paypal-payments' );

		$this->init_form_fields();
		$this->init_settings();

		add_action(
			'woocommerce_update_options_payment_gateways_' . $this->id,
			array(
				$this,
				'process_admin_options',
			)
		);

		$this->order_endpoint           = $order_endpoint;
		$this->purchase_unit_factory    = $purchase_unit_factory;
		$this->payment_source_factory   = $payment_source_factory;
		$this->logger                   = $logger;
		$this->environment              = $environment;
		$this->transaction_url_provider = $transaction_url_provider;
		$this->pui_helper               = $pui_helper;
	}

	/**
	 * Initialize the form fields.
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'enabled'                       => array(
				'title'       => __( 'Enable/Disable', 'woocommerce-paypal-payments' ),
				'type'        => 'checkbox',
				'label'       => __( 'Pay upon Invoice', 'woocommerce-paypal-payments' ),
				'default'     => 'no',
				'desc_tip'    => true,
				'description' => __( 'Enable/Disable Pay Upon Invoice payment gateway.', 'woocommerce-paypal-payments' ),
			),
			'title'                         => array(
				'title'       => __( 'Title', 'woocommerce-paypal-payments' ),
				'type'        => 'text',
				'default'     => $this->title,
				'desc_tip'    => true,
				'description' => __( 'This controls the title which the user sees during checkout.', 'woocommerce-paypal-payments' ),
			),
			'description'                   => array(
				'title'       => __( 'Description', 'woocommerce-paypal-payments' ),
				'type'        => 'text',
				'default'     => $this->description,
				'desc_tip'    => true,
				'description' => __( 'This controls the description which the user sees during checkout.', 'woocommerce-paypal-payments' ),
			),
			'experience_context'            => array(
				'title'       => __( 'Experience Context', 'woocommerce-paypal-payments' ),
				'type'        => 'title',
				'description' => __( "Specify brand name, logo and customer service instructions to be presented on Ratepay's payment instructions.", 'woocommerce-paypal-payments' ),
			),
			'brand_name'                    => array(
				'title'       => __( 'Brand name', 'woocommerce-paypal-payments' ),
				'type'        => 'text',
				'default'     => get_bloginfo( 'name' ) ?? '',
				'desc_tip'    => true,
				'description' => __( 'Merchant name displayed in Ratepay\'s payment instructions.', 'woocommerce-paypal-payments' ),
			),
			'logo_url'                      => array(
				'title'       => __( 'Logo URL', 'woocommerce-paypal-payments' ),
				'type'        => 'url',
				'default'     => '',
				'desc_tip'    => true,
				'description' => __( 'Logo to be presented on Ratepay\'s payment instructions.', 'woocommerce-paypal-payments' ),
			),
			'customer_service_instructions' => array(
				'title'       => __( 'Customer service instructions', 'woocommerce-paypal-payments' ),
				'type'        => 'text',
				'default'     => '',
				'desc_tip'    => true,
				'description' => __( 'Customer service instructions to be presented on Ratepay\'s payment instructions.', 'woocommerce-paypal-payments' ),
			),
		);
	}

	/**
	 * Processes the order.
	 *
	 * @param int $order_id The WC order ID.
	 * @return array
	 */
	public function process_payment( $order_id ) {
		$wc_order   = wc_get_order( $order_id );
		$birth_date = filter_input( INPUT_POST, 'billing_birth_date', FILTER_SANITIZE_STRING ) ?? '';

		$pay_for_order = filter_input( INPUT_GET, 'pay_for_order', FILTER_SANITIZE_STRING );
		if ( 'true' === $pay_for_order ) {
			if ( ! $this->pui_helper->validate_birth_date( $birth_date ) ) {
				wc_add_notice( 'Invalid birth date.', 'error' );
				return array(
					'result' => 'failure',
				);
			}
		}

		$wc_order->update_status( 'on-hold', __( 'Awaiting Pay Upon Invoice payment.', 'woocommerce-paypal-payments' ) );
		$purchase_unit  = $this->purchase_unit_factory->from_wc_order( $wc_order );
		$payment_source = $this->payment_source_factory->from_wc_order( $wc_order, $birth_date );

		try {
			$order = $this->order_endpoint->create( array( $purchase_unit ), $payment_source );
			$this->add_paypal_meta( $wc_order, $order, $this->environment );

			as_schedule_single_action(
				time() + ( 5 * MINUTE_IN_SECONDS ),
				'woocommerce_paypal_payments_check_pui_payment_captured',
				array(
					'order_id' => $order_id,
				)
			);

			WC()->cart->empty_cart();

			return array(
				'result'   => 'success',
				'redirect' => $this->get_return_url( $wc_order ),
			);
		} catch ( RuntimeException $exception ) {
			$error = $exception->getMessage();

			if ( is_a( $exception, PayPalApiException::class ) && is_array( $exception->details() ) ) {
				$details = '';
				foreach ( $exception->details() as $detail ) {
					$issue       = $detail->issue ?? '';
					$field       = $detail->field ?? '';
					$description = $detail->description ?? '';
					$details    .= $issue . ' ' . $field . ' ' . $description . '<br>';
				}

				$error = $details;
			}

			$this->logger->error( $error );
			wc_add_notice( $error, 'error' );

			$wc_order->update_status(
				'failed',
				$error
			);

			return array(
				'result'   => 'failure',
				'redirect' => wc_get_checkout_url(),
			);
		}
	}

	/**
	 * Return transaction url for this gateway and given order.
	 *
	 * @param WC_Order $order WC order to get transaction url by.
	 *
	 * @return string
	 */
	public function get_transaction_url( $order ): string {
		$this->view_transaction_url = $this->transaction_url_provider->get_transaction_url_base( $order );

		return parent::get_transaction_url( $order );
	}
}
