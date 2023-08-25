<?php
/**
 * The Googlepay module services.
 *
 * @package WooCommerce\PayPalCommerce\Googlepay
 */

declare(strict_types=1);

namespace WooCommerce\PayPalCommerce\Googlepay;

use Automattic\WooCommerce\Blocks\Payments\PaymentMethodTypeInterface;
use WooCommerce\PayPalCommerce\Button\Assets\ButtonInterface;
use WooCommerce\PayPalCommerce\Googlepay\Assets\BlocksPaymentMethod;
use WooCommerce\PayPalCommerce\Googlepay\Assets\Button;
use WooCommerce\PayPalCommerce\Vendor\Psr\Container\ContainerInterface;

return array(
	// TODO.

	'googlepay.button'                => static function ( ContainerInterface $container ): ButtonInterface {
		// TODO : check other statuses.

		return new Button(
			$container->get( 'googlepay.url' ),
			$container->get( 'googlepay.sdk_url' ),
			$container->get( 'ppcp.asset-version' ),
			$container->get( 'session.handler' ),
			$container->get( 'wcgateway.settings' ),
			$container->get( 'onboarding.environment' ),
			$container->get( 'wcgateway.settings.status' ),
			$container->get( 'api.shop.currency' ),
			$container->get( 'woocommerce.logger.woocommerce' )
		);
	},

	'googlepay.blocks-payment-method' => static function ( ContainerInterface $container ): PaymentMethodTypeInterface {
		return new BlocksPaymentMethod(
			'ppcp-googlepay',
			$container->get( 'googlepay.url' ),
			$container->get( 'ppcp.asset-version' ),
			$container->get( 'googlepay.button' ),
			$container->get( 'blocks.method' )
		);
	},

	'googlepay.url'                   => static function ( ContainerInterface $container ): string {
		$path = realpath( __FILE__ );
		if ( false === $path ) {
			return '';
		}
		return plugins_url(
			'/modules/ppcp-googlepay/',
			dirname( $path, 3 ) . '/woocommerce-paypal-payments.php'
		);
	},

	'googlepay.sdk_url'               => static function ( ContainerInterface $container ): string {
		return 'https://pay.google.com/gp/p/js/pay.js';
	},

);
