<?php
/**
 * Service that fills checkout address fields
 * with address selected via PayPal
 *
 * @package Inpsyde\PayPalCommerce\WcGateway\Checkout
 */

declare(strict_types=1);

namespace Inpsyde\PayPalCommerce\WcGateway\Checkout;

use Inpsyde\PayPalCommerce\ApiClient\Entity\Shipping;
use Inpsyde\PayPalCommerce\Session\SessionHandler;

/**
 * Class CheckoutPayPalAddressPreset
 */
class CheckoutPayPalAddressPreset {

	/**
	 * Caches Shipping objects for orders.
	 *
	 * @var array
	 */
	private $shipping_cache = array();

	/**
	 * The Session Handler.
	 *
	 * @var SessionHandler
	 */
	private $session_handler;

	/**
	 * CheckoutPayPalAddressPreset constructor.
	 *
	 * @param SessionHandler $session_handler The session handler.
	 */
	public function __construct( SessionHandler $session_handler ) {
		$this->session_handler = $session_handler;
	}

	/**
	 * Filters the checkout fields to replace values if necessary.
	 *
	 * @wp-hook woocommerce_checkout_get_value
	 *
	 * @param string|null $default_value The default value.
	 * @param string      $field_id The field ID.
	 *
	 * @return string|null
	 */
	public function filter_checkout_field( $default_value, $field_id ): ?string {
		if ( ! is_string( $default_value ) ) {
			$default_value = null;
		}

		if ( ! is_string( $field_id ) ) {
			return $default_value;
		}

		return $this->read_preset_for_field( $field_id ) ?? $default_value;
	}

	/**
	 * Returns the value for a checkout field from an PayPal order if given.
	 *
	 * @param string $field_id The ID of the field.
	 *
	 * @return string|null
	 */
	private function read_preset_for_field( string $field_id ): ?string {
		$order = $this->session_handler->order();
		if ( ! $order ) {
			return null;
		}

		$shipping = $this->read_shipping_from_order();
		$payer    = $order->payer();

		$address_map     = array(
			'billing_address_1' => 'addressLine1',
			'billing_address_2' => 'addressLine2',
			'billing_postcode'  => 'postalCode',
			'billing_country'   => 'countryCode',
			'billing_city'      => 'adminArea2',
			'billing_state'     => 'adminArea1',
		);
		$payer_name_map  = array(
			'billing_last_name'  => 'surname',
			'billing_first_name' => 'givenName',
		);
		$payer_map       = array(
			'billing_email' => 'emailAddress',
		);
		$payer_phone_map = array(
			'billing_phone' => 'nationalNumber',
		);

		if ( array_key_exists( $field_id, $address_map ) && $shipping ) {
			return $shipping->address()->{$address_map[ $field_id ]}() ? $shipping->address()->{$address_map[ $field_id ]}() : null;
		}

		if ( array_key_exists( $field_id, $payer_name_map ) && $payer ) {
			return $payer->name()->{$payer_name_map[ $field_id ]}() ? $payer->name()->{$payer_name_map[ $field_id ]}() : null;
		}

		if ( array_key_exists( $field_id, $payer_map ) && $payer ) {
			return $payer->{$payer_map[ $field_id ]}() ? $payer->{$payer_map[ $field_id ]}() : null;
		}

		if (
			array_key_exists( $field_id, $payer_phone_map )
			&& $payer
			&& $payer->phone()
			&& $payer->phone()->phone()
		) {
			return $payer->phone()->phone()->{$payer_phone_map[ $field_id ]}() ? $payer->phone()->phone()->{$payer_phone_map[ $field_id ]}() : null;
		}

		return null;
	}

	/**
	 * Returns the Shipping object for an order, if given.
	 *
	 * @return Shipping|null
	 */
	private function read_shipping_from_order(): ?Shipping {
		$order = $this->session_handler->order();
		if ( ! $order ) {
			return null;
		}

		if ( array_key_exists( $order->id(), $this->shipping_cache ) ) {
			return $this->shipping_cache[ $order->id() ];
		}

		$shipping = null;
		foreach ( $this->session_handler->order()->purchaseUnits() as $unit ) {
			$shipping = $unit->shipping();
			if ( $shipping ) {
				break;
			}
		}

		$this->shipping_cache[ $order->id() ] = $shipping;

		return $shipping;
	}
}
