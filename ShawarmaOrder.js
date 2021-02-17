const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    SIZE:   Symbol("size"),
    TOPPINGS:   Symbol("toppings"),
    CURRY: Symbol("curry"),
    DRINKS:  Symbol("drinks"),
    PAYMENT: Symbol("payment")
});

let total = 0;

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sToppings = "";
        this.sCurry = "";
        this.sDrinks = "";
        this.sItem1 = "Dosa";
        this.sItem2 = "Curry"
        this.sTotal = total;
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.SIZE;
                aReturn.push("Welcome to Richard's Hut.");
                aReturn.push("What size Dosa would you like?");
                break;
            case OrderState.SIZE:
              if (sInput.toLowerCase() == "medium" || sInput.toLowerCase() == "large" || sInput.toLowerCase() == "small"){
                this.stateCur = OrderState.TOPPINGS
                this.sSize = sInput;
                switch(sInput.toLowerCase()){
                  case "medium":
                    this.sTotal = this.sTotal + 5;
                    break;
                  case "large":
                    this.sTotal = this.sTotal + 4;
                    break;
                  case "small":
                    this.sTotal = this.sTotal + 3;
                    break;
                }
                aReturn.push("What fillings would you like?");
              } else {
                aReturn.push("please enter MEDIUM, SMALL, or LARGE")
              }
                break;
            case OrderState.TOPPINGS:
              if (sInput.toLowerCase() == "pepperoni" || sInput.toLowerCase() == "salami" || sInput.toLowerCase() == "teriyaki" || sInput.toLowerCase() == "keema"){
                this.stateCur = OrderState.CURRY
                this.sToppings = sInput;
                switch(sInput.toLowerCase()){
                  case "pepperoni":
                    this.sTotal = this.sTotal + 1;
                    break;
                  case "salami":
                    this.sTotal = this.sTotal + 2;
                  case "teriyaki":
                    this.sTotal = this.sTotal + 3;
                  case "keema":
                    this.sTotal = this.sTotal + 4;
                }
                aReturn.push("What kind of curry would you like with that?");
              } else {
                aReturn.push("options are pepperoni, salami, teriyaki, and keema")
              }
                break;
            case OrderState.CURRY:
                if (sInput.toLowerCase() == "vindaloo" || sInput.toLowerCase() == "coconut" || sInput.toLowerCase() == "chickpea"){
                    this.stateCur = OrderState.DRINKS
                    this.sCurry = sInput;
                    switch(sInput.toLowerCase()){
                        case "vindaloo":
                            this.sTotal = this.sTotal + 6;
                            break;
                        case "coconut":
                            this.sTotal = this.sTotal + 8;
                        case "chickpea":
                            this.sTotal = this.sTotal + 5;
                    }
                    aReturn.push("Would you like drinks with that?")
                } else {
                    aReturn.push("options are vindaloo, coconut and chickpea")
                }
                break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                this.nOrder = this.sTotal;
                if(sInput.toLowerCase() != "no"){
                    this.sDrinks = sInput;
                }
                aReturn.push("Thank-you for your order of");
                aReturn.push(`${this.sSize} ${this.sItem1} with ${this.sToppings}`);
                if(this.sDrinks){
                    aReturn.push(this.sDrinks);
                }
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered at ${d.toTimeString()} to ${sInput.payer.address.country_code}`);
                break;
        }
        return aReturn;
    }
    renderForm(){
      // your client id should be kept private
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}