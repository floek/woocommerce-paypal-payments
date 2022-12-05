<?php
/**
 * The payment tokens migration handler.
 *
 * @package WooCommerce\PayPalCommerce\Vaulting
 */

declare(strict_types=1);

namespace WooCommerce\PayPalCommerce\Vaulting;

use WC_Payment_Token_CC;
use WooCommerce\PayPalCommerce\WcGateway\Gateway\CreditCardGateway;
use WooCommerce\PayPalCommerce\WcGateway\Gateway\PayPalGateway;

/**
 * Class PaymentTokensMigration
 */
class PaymentTokensMigration {

	/**
	 * WC Payment token PayPal.
	 *
	 * @var PaymentTokenPayPal
	 */
	private $payment_token_paypal;

	/**
	 * PaymentTokensMigration constructor.
	 *
	 * @param PaymentTokenPayPal $payment_token_paypal WC Payment token PayPal.
	 */
	public function __construct( PaymentTokenPayPal $payment_token_paypal ) {
		$this->payment_token_paypal = $payment_token_paypal;
	}

	/**
	 * Migrates user existing vaulted tokens into WC payment tokens API.
	 *
	 * @param int $id WooCommerce customer id.
	 */
	public function migrate_payment_tokens_for_user( int $id ) {
		$tokens = (array) get_user_meta( $id, PaymentTokenRepository::USER_META, true );

		foreach ( $tokens as $token ) {
			if ( isset( $token->source->card ) ) {
				$payment_token = new WC_Payment_Token_CC();
				$payment_token->set_token( $token->id() );
				$payment_token->set_user_id( $id );
				$payment_token->set_gateway_id( CreditCardGateway::ID );

				$payment_token->set_last4( $token->source()->card->last_digits );
				$token->set_card_type( $token->source()->card->brand );
				$token->save();

			} elseif ( $token->source->card ) {
				$this->payment_token_paypal->set_token( $token->id() );
				$this->payment_token_paypal->set_user_id( $id );
				$this->payment_token_paypal->set_gateway_id( PayPalGateway::ID );
				$this->payment_token_paypal->save();
			}
		}
	}
}
