!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=1)}([,function(e,t,r){"use strict";r.r(t);var n=class{constructor(e){this.genericErrorText=e,this.wrapper=document.querySelector(".woocommerce-notices-wrapper")}genericError(){this.wrapper.classList.contains("ppcp-persist")||(this.clear(),this.message(this.genericErrorText))}message(e,t=!1){this.wrapper.classList.add("woocommerce-error"),t?this.wrapper.classList.add("ppcp-persist"):this.wrapper.classList.remove("ppcp-persist"),this.wrapper.innerText=this.sanitize(e),jQuery.scroll_to_notices(jQuery(".woocommerce-notices-wrapper"))}sanitize(e){const t=document.createElement("textarea");return t.innerHTML=e,t.value.replace("Error: ","")}clear(){this.wrapper.classList.contains("woocommerce-error")&&(this.wrapper.classList.remove("woocommerce-error"),this.wrapper.innerText="")}};var o=(e,t)=>(r,n)=>fetch(e.config.ajax.approve_order.endpoint,{method:"POST",body:JSON.stringify({nonce:e.config.ajax.approve_order.nonce,order_id:r.orderID})}).then(e=>e.json()).then(r=>{if(!r.success)return t.genericError(),n.restart().catch(e=>{t.genericError()});location.href=e.config.redirect});const a=()=>{const e=PayPalCommerceGateway.payer;if(!e)return null;const t=document.querySelector("#billing_phone")||void 0!==e.phone?{phone_type:"HOME",phone_number:{national_number:document.querySelector("#billing_phone")?document.querySelector("#billing_phone").value:e.phone.phone_number.national_number}}:null,r={email_address:document.querySelector("#billing_email")?document.querySelector("#billing_email").value:e.email_address,name:{surname:document.querySelector("#billing_last_name")?document.querySelector("#billing_last_name").value:e.name.surname,given_name:document.querySelector("#billing_first_name")?document.querySelector("#billing_first_name").value:e.name.given_name},address:{country_code:document.querySelector("#billing_country")?document.querySelector("#billing_country").value:e.address.country_code,address_line_1:document.querySelector("#billing_address_1")?document.querySelector("#billing_address_1").value:e.address.address_line_1,address_line_2:document.querySelector("#billing_address_2")?document.querySelector("#billing_address_2").value:e.address.address_line_2,admin_area_1:document.querySelector("#billing_city")?document.querySelector("#billing_city").value:e.address.admin_area_1,admin_area_2:document.querySelector("#billing_state")?document.querySelector("#billing_state").value:e.address.admin_area_2,postal_code:document.querySelector("#billing_postcode")?document.querySelector("#billing_postcode").value:e.address.postal_code}};return t&&(r.phone=t),r};var i=class{constructor(e,t){this.config=e,this.errorHandler=t}configuration(){return{createOrder:(e,t)=>{const r=a(),n=void 0!==this.config.bn_codes[this.config.context]?this.config.bn_codes[this.config.context]:"";return fetch(this.config.ajax.create_order.endpoint,{method:"POST",body:JSON.stringify({nonce:this.config.ajax.create_order.nonce,purchase_units:[],bn_code:n,payer:r,context:this.config.context})}).then((function(e){return e.json()})).then((function(e){if(!e.success)throw console.error(e),Error(e.data.message);return e.data.id}))},onApprove:o(this,this.errorHandler),onError:e=>{this.errorHandler.genericError()}}}};var s=class{constructor(e,t){this.gateway=e,this.renderer=t,this.actionHandler=null}init(){this.actionHandler=new i(PayPalCommerceGateway,new n(this.gateway.labels.error.generic)),this.render(),jQuery(document.body).on("wc_fragments_loaded wc_fragments_refreshed",()=>{this.render()})}shouldRender(){return null!==document.querySelector(this.gateway.button.mini_cart_wrapper)||null!==document.querySelector(this.gateway.hosted_fields.mini_cart_wrapper)}render(){this.shouldRender()&&this.renderer.render(this.gateway.button.mini_cart_wrapper,this.gateway.hosted_fields.mini_cart_wrapper,this.actionHandler.configuration())}};var c=class{constructor(e,t,r){this.id=e,this.quantity=t,this.variations=r}data(){return{id:this.id,quantity:this.quantity,variations:this.variations}}};var d=class{constructor(e,t){this.endpoint=e,this.nonce=t}update(e,t){return new Promise((r,n)=>{fetch(this.endpoint,{method:"POST",body:JSON.stringify({nonce:this.nonce,products:t})}).then(e=>e.json()).then(t=>{if(!t.success)return void n(t.data);const o=e(t.data);r(o)})})}};var u=class{constructor(e,t,r){this.element=e,this.showCallback=t,this.hideCallback=r,this.observer=null}init(){const e=()=>{this.element.classList.contains("disabled")?this.hideCallback():this.showCallback()};this.observer=new MutationObserver(e),this.observer.observe(this.element,{attributes:!0}),e()}disconnect(){this.observer.disconnect()}};var l=class{constructor(e,t,r,n,o,a){this.config=e,this.updateCart=t,this.showButtonCallback=r,this.hideButtonCallback=n,this.formElement=o,this.errorHandler=a}configuration(){if(this.hasVariations()){new u(this.formElement.querySelector(".single_add_to_cart_button"),this.showButtonCallback,this.hideButtonCallback).init()}return{createOrder:this.createOrder(),onApprove:o(this,this.errorHandler),onError:e=>{this.errorHandler.genericError()}}}createOrder(){var e=null;e=this.isGroupedProduct()?()=>{const e=[];return this.formElement.querySelectorAll('input[type="number"]').forEach(t=>{if(!t.value)return;const r=t.getAttribute("name").match(/quantity\[([\d]*)\]/);if(2!==r.length)return;const n=parseInt(r[1]),o=parseInt(t.value);e.push(new c(n,o,null))}),e}:()=>{const e=document.querySelector('[name="add-to-cart"]').value,t=document.querySelector('[name="quantity"]').value,r=this.variations();return[new c(e,t,r)]};return(t,r)=>{this.errorHandler.clear();return this.updateCart.update(e=>{const t=a(),r=void 0!==this.config.bn_codes[this.config.context]?this.config.bn_codes[this.config.context]:"";return fetch(this.config.ajax.create_order.endpoint,{method:"POST",body:JSON.stringify({nonce:this.config.ajax.create_order.nonce,purchase_units:e,payer:t,bn_code:r,context:this.config.context})}).then((function(e){return e.json()})).then((function(e){if(!e.success)throw console.error(e),Error(e.data.message);return e.data.id}))},e())}}variations(){if(!this.hasVariations())return null;return[...this.formElement.querySelectorAll("[name^='attribute_']")].map(e=>({value:e.value,name:e.name}))}hasVariations(){return this.formElement.classList.contains("variations_form")}isGroupedProduct(){return this.formElement.classList.contains("grouped_form")}};var h=class{constructor(e,t,r){this.gateway=e,this.renderer=t,this.messages=r}init(){this.shouldRender()?this.render():this.renderer.hideButtons(this.gateway.hosted_fields.wrapper)}shouldRender(){return null!==document.querySelector("form.cart")}render(){const e=new l(this.gateway,new d(this.gateway.ajax.change_cart.endpoint,this.gateway.ajax.change_cart.nonce),()=>{this.renderer.showButtons(this.gateway.button.wrapper),this.renderer.showButtons(this.gateway.hosted_fields.wrapper);let e="0";document.querySelector("form.cart ins .woocommerce-Price-amount")?e=document.querySelector("form.cart ins .woocommerce-Price-amount").innerText:document.querySelector("form.cart .woocommerce-Price-amount")&&(e=document.querySelector("form.cart .woocommerce-Price-amount").innerText);const t=parseInt(e.replace(/([^\d,\.\s]*)/g,""));this.messages.renderWithAmount(t)},()=>{this.renderer.hideButtons(this.gateway.button.wrapper),this.renderer.hideButtons(this.gateway.hosted_fields.wrapper)},document.querySelector("form.cart"),new n(this.gateway.labels.error.generic));this.renderer.render(this.gateway.button.wrapper,this.gateway.hosted_fields.wrapper,e.configuration())}};var p=class{constructor(e,t){this.gateway=e,this.renderer=t}init(){this.shouldRender()&&(this.render(),jQuery(document.body).on("updated_cart_totals updated_checkout",()=>{this.render()}))}shouldRender(){return null!==document.querySelector(this.gateway.button.wrapper)||null!==document.querySelector(this.gateway.hosted_fields.wrapper)}render(){const e=new i(PayPalCommerceGateway,new n(this.gateway.labels.error.generic));this.renderer.render(this.gateway.button.wrapper,this.gateway.hosted_fields.wrapper,e.configuration())}};var m=(e,t)=>(r,n)=>fetch(e.config.ajax.approve_order.endpoint,{method:"POST",body:JSON.stringify({nonce:e.config.ajax.approve_order.nonce,order_id:r.orderID})}).then(e=>e.json()).then(e=>{if(!e.success){if(t.genericError(),console.error(e),console.log(n),void 0!==n.restart)return n.restart();throw new Error(e.data.message)}document.querySelector("#place_order").click()});var y=class{constructor(e,t){this.config=e,this.errorHandler=t}configuration(){return{createOrder:(e,t)=>{const r=a(),n=void 0!==this.config.bn_codes[this.config.context]?this.config.bn_codes[this.config.context]:"",o=this.errorHandler,i=jQuery("form.checkout").serialize();return fetch(this.config.ajax.create_order.endpoint,{method:"POST",body:JSON.stringify({nonce:this.config.ajax.create_order.nonce,payer:r,bn_code:n,context:this.config.context,form:i})}).then((function(e){return e.json()})).then((function(e){if(!e.success)return void o.message(e.data.message,!0);const t=document.createElement("input");return t.setAttribute("type","hidden"),t.setAttribute("name","ppcp-resume-order"),t.setAttribute("value",e.data.purchase_units[0].custom_id),document.querySelector("form.checkout").append(t),e.data.id}))},onApprove:m(this,this.errorHandler),onError:e=>{this.errorHandler.genericError()}}}};var f=class{constructor(e,t,r){this.gateway=e,this.renderer=t,this.messages=r}init(){this.render(),jQuery(document.body).on("updated_checkout",()=>{this.render()}),jQuery(document.body).on("updated_checkout payment_method_selected",()=>{this.switchBetweenPayPalandOrderButton()}),this.switchBetweenPayPalandOrderButton()}shouldRender(){return!document.querySelector(this.gateway.button.cancel_wrapper)&&(null!==document.querySelector(this.gateway.button.wrapper)||null!==document.querySelector(this.gateway.hosted_fields.wrapper))}render(){if(!this.shouldRender())return;document.querySelector(this.gateway.hosted_fields.wrapper+">div")&&document.querySelector(this.gateway.hosted_fields.wrapper+">div").setAttribute("style","");const e=new y(PayPalCommerceGateway,new n(this.gateway.labels.error.generic));this.renderer.render(this.gateway.button.wrapper,this.gateway.hosted_fields.wrapper,e.configuration())}switchBetweenPayPalandOrderButton(){const e=jQuery('input[name="payment_method"]:checked').val();"ppcp-gateway"!==e&&"ppcp-credit-card-gateway"!==e?(this.renderer.hideButtons(this.gateway.button.wrapper),this.renderer.hideButtons(this.gateway.messages.wrapper),this.renderer.hideButtons(this.gateway.hosted_fields.wrapper),jQuery("#place_order").show()):(jQuery("#place_order").hide(),"ppcp-gateway"===e&&(this.renderer.showButtons(this.gateway.button.wrapper),this.renderer.showButtons(this.gateway.messages.wrapper),this.messages.render(),this.renderer.hideButtons(this.gateway.hosted_fields.wrapper)),"ppcp-credit-card-gateway"===e&&(this.renderer.hideButtons(this.gateway.button.wrapper),this.renderer.hideButtons(this.gateway.messages.wrapper),this.renderer.showButtons(this.gateway.hosted_fields.wrapper)))}};var g=class{constructor(e,t){this.defaultConfig=t,this.creditCardRenderer=e}render(e,t,r){this.renderButtons(e,r),this.creditCardRenderer.render(t,r)}renderButtons(e,t){if(!document.querySelector(e)||this.isAlreadyRendered(e))return;const r=e===this.defaultConfig.button.wrapper?this.defaultConfig.button.style:this.defaultConfig.button.mini_cart_style;paypal.Buttons({style:r,...t}).render(e)}isAlreadyRendered(e){return document.querySelector(e).hasChildNodes()}hideButtons(e){const t=document.querySelector(e);return!!t&&(t.style.display="none",!0)}showButtons(e){const t=document.querySelector(e);return!!t&&(t.style.display="block",!0)}};var w=class{constructor(e,t){this.defaultConfig=e,this.errorHandler=t}render(e,t){if("checkout"===this.defaultConfig.context&&null!==e&&null!==document.querySelector(e))if(void 0!==paypal.HostedFields&&paypal.HostedFields.isEligible())this.defaultConfig.enforce_vault&&document.querySelector(e+" .ppcp-credit-card-vault")&&(document.querySelector(e+" .ppcp-credit-card-vault").checked=!0,document.querySelector(e+" .ppcp-credit-card-vault").setAttribute("disabled",!0)),paypal.HostedFields.render({createOrder:t.createOrder,fields:{number:{selector:e+" .ppcp-credit-card",placeholder:this.defaultConfig.hosted_fields.labels.credit_card_number},cvv:{selector:e+" .ppcp-cvv",placeholder:this.defaultConfig.hosted_fields.labels.cvv},expirationDate:{selector:e+" .ppcp-expiration-date",placeholder:this.defaultConfig.hosted_fields.labels.mm_yyyy}}}).then(r=>{const n=n=>{n&&n.preventDefault(),this.errorHandler.clear();const o=r.getState();if(Object.keys(o.fields).every((function(e){return o.fields[e].isValid}))){let n=!!document.querySelector(e+" .ppcp-credit-card-vault")&&document.querySelector(e+" .ppcp-credit-card-vault").checked;n=this.defaultConfig.enforce_vault||n,r.submit({contingencies:["3D_SECURE"],vault:n}).then(e=>(e.orderID=e.orderId,t.onApprove(e)))}else this.errorHandler.message(this.defaultConfig.hosted_fields.labels.fields_not_valid)};r.on("inputSubmitRequest",(function(){n(null)})),document.querySelector(e).addEventListener("submit",n)});else{const t=document.querySelector(e);t.parentNode.removeChild(t)}}};const _=(e,t)=>{if(!e)return!1;if(e.user!==t)return!1;return!((new Date).getTime()>=1e3*e.expiration)};var b=(e,t)=>{const r=(e=>{const t=JSON.parse(sessionStorage.getItem("ppcp-data-client-id"));return _(t,e)?t.token:null})(t.user);if(r)return e.setAttribute("data-client-token",r),void document.body.append(e);fetch(t.endpoint,{method:"POST",body:JSON.stringify({nonce:t.nonce})}).then(e=>e.json()).then(r=>{_(r,t.user)&&((e=>{sessionStorage.setItem("ppcp-data-client-id",JSON.stringify(e))})(r),e.setAttribute("data-client-token",r.token),document.body.append(e))})};var v=class{constructor(e){this.config=e}render(){this.shouldRender()&&paypal.Messages({amount:this.config.amount,placement:this.config.placement,style:this.config.style}).render(this.config.wrapper)}renderWithAmount(e){if(!this.shouldRender())return;const t=document.createElement("div");t.setAttribute("id",this.config.wrapper.replace("#",""));const r=document.querySelector(this.config.wrapper).nextSibling;document.querySelector(this.config.wrapper).parentElement.removeChild(document.querySelector(this.config.wrapper)),r.parentElement.insertBefore(t,r),paypal.Messages({amount:e,placement:this.config.placement,style:this.config.style}).render(this.config.wrapper)}shouldRender(){return void 0!==paypal.Messages&&void 0!==this.config.wrapper&&!!document.querySelector(this.config.wrapper)}};document.addEventListener("DOMContentLoaded",()=>{const e=document.createElement("script");e.addEventListener("load",e=>{(()=>{const e=new n(PayPalCommerceGateway.labels.error.generic),t=new w(PayPalCommerceGateway,e),r=new g(t,PayPalCommerceGateway),o=new v(PayPalCommerceGateway.messages),a=PayPalCommerceGateway.context;if("mini-cart"===a||"product"===a){new s(PayPalCommerceGateway,r).init()}if("product"===a){new h(PayPalCommerceGateway,r,o).init()}if("cart"===a){new p(PayPalCommerceGateway,r).init()}if("checkout"===a){new f(PayPalCommerceGateway,r,o).init()}"checkout"!==a&&o.render()})()}),e.setAttribute("src",PayPalCommerceGateway.button.url),Object.entries(PayPalCommerceGateway.script_attributes).forEach(t=>{e.setAttribute(t[0],t[1])}),PayPalCommerceGateway.data_client_id.set_attribute?b(e,PayPalCommerceGateway.data_client_id):document.body.append(e)})}]);
//# sourceMappingURL=button.js.map