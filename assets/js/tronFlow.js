let currentAccount;
let lastTransactionTime;
let contractAddress;


contractAddress = 'TFrBVjdpsuWQUMtjFpMxhUKg2q3oa6rgGv';


const defaultSponsor = 'TGiyNohpFQcCauqqaePLtH8JSop3jBeRFn';
let invested;
let connected = false;

window.addEventListener('message', (e) => {
  if (e.data?.message?.action == 'tabReply') {
    console.warn('tabReply event', e.data.message);
    if (e.data?.message?.data?.data?.node?.chain == '_') {
      console.info('tronLink currently selects the main chain');
    } else {
      console.info('tronLink currently selects the side chain');
    }
  } else if (e.data?.message?.action == 'setAccount') {
    //showPopup('Account Changed', 'success');
    console.warn('setAccount event', e.data.message);
    console.info('current address:', e.data.message.data.address);
  } else if (e.data?.message?.action == 'setNode') {
    console.warn('setNode event', e.data.message);
    if (e.data?.message?.data?.data?.node?.chain == '_') {
      console.info('tronLink currently selects the main chain');
    } else {
      console.info('tronLink currently selects the side chain');
    }
  }
});

/**
 *
 */
$(document).ready(async () => {
  const url = new URL(window.location);
  const params = new URLSearchParams(url.search);

  var checkConnectivity = setInterval(async () => {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
      // clearInterval(checkConnectivity);
      if (!connected) {
        showPopup('Connected to Tron LINK.', 'success');
        connected = true;
      }

      const tronWeb = window.tronWeb;
      currentAccount = tronWeb.defaultAddress.base58;
      $('#address').text(currentAccount);

      const contract = await tronWeb.contract().at(contractAddress);
      
    
      getTotalInvested(contract);
      getTotalInvestors(contract);
      getContractBalanceRate(contract);
      getuserpayout(contract);
      getreferral(contract);
      invested = await getDeposit(contract);
      let profit, totalProfit, halfProfit;
      if (parseInt(invested) > 0) {
        profit = await getProfit(contract);

        totalProfit = (profit.toNumber() / 1000000).toFixed(6);
        halfProfit = (profit.toNumber() / 2000000).toFixed(6);

        $('#refererAddress').val('You Already have a Sponsor');
        $('#refererAddress').prop('disabled', true);

        $('#accountRef').val(
          window.location.hostname + '?ref=' + currentAccount
        );
      } else {
        if (params.has('ref')) {
          $('#refererAddress').prop('disabled', true);
          $('#refererAddress').val(params.get('ref'));
        } else if ($('#refererAddress').val() == 'You Already have a Sponsor') {
          $('#refererAddress').prop('disabled', false);
          $('#refererAddress').val('');
        }
        $('#accountRef').val(
          'You need to invest at least 50 TRX to activate the referral link.'
        );

        totalProfit = halfProfit = 0;
      }

      $('#withdrawableAmount').val(halfProfit);
      $('.deduction').text(halfProfit);
      $('#withdrawableInterest').val(halfProfit);
      $('#totalWithdrawable').val(totalProfit);
      $('#invested').text(totalProfit);
      $('#withdrawal').text((halfProfit / 2).toFixed(6));

      $('#reinvest-new-balance').text(
        parseFloat(
          parseFloat($('#actualCapital').val()) + parseFloat(halfProfit)
        ).toFixed(6)
      );
      $('#withdrawal-new-balance').text(
        parseFloat(
          parseFloat($('#actualCapital').val()) - parseFloat(halfProfit)
        ).toFixed(6)
      );

      getBalanceOfAccount();
    
    
    setTimeout(function() {
                var accountInterval = setInterval(async () => {
                    if (window.tronWeb.defaultAddress.base58 !== currentAccount) {
                        const tronWeb = window.tronWeb;
      currentAccount = tronWeb.defaultAddress.base58;
      $('#address').text(currentAccount);

      const contract = await tronWeb.contract().at(contractAddress);
      
    
      getTotalInvested(contract);
      getTotalInvestors(contract);
      getContractBalanceRate(contract);
      getuserpayout(contract);
      getreferral(contract);
      invested = await getDeposit(contract);
      let profit, totalProfit, halfProfit;
      if (parseInt(invested) > 0) {
        profit = await getProfit(contract);

        totalProfit = (profit.toNumber() / 1000000).toFixed(6);
        halfProfit = (profit.toNumber() / 2000000).toFixed(6);

        $('#refererAddress').val('You Already have a Sponsor');
        $('#refererAddress').prop('disabled', true);

        $('#accountRef').val(
          window.location.hostname + '?ref=' + currentAccount
        );
      } else {
        if (params.has('ref')) {
          $('#refererAddress').prop('disabled', true);
          $('#refererAddress').val(params.get('ref'));
        } else if ($('#refererAddress').val() == 'You Already have a Sponsor') {
          $('#refererAddress').prop('disabled', false);
          $('#refererAddress').val('');
        }
        $('#accountRef').val(
          'You need to invest at least 50 TRX to activate the referral link.'
        );

        totalProfit = halfProfit = 0;
      }

      $('#withdrawableAmount').val(halfProfit);
      $('.deduction').text(halfProfit);
      $('#withdrawableInterest').val(halfProfit);
      $('#totalWithdrawable').val(totalProfit);
      $('#invested').text(totalProfit);
      $('#withdrawal').text((halfProfit / 2).toFixed(6));

      $('#reinvest-new-balance').text(
        parseFloat(
          parseFloat($('#actualCapital').val()) + parseFloat(halfProfit)
        ).toFixed(6)
      );
      $('#withdrawal-new-balance').text(
        parseFloat(
          parseFloat($('#actualCapital').val()) - parseFloat(halfProfit)
        ).toFixed(6)
      );

      getBalanceOfAccount();
                    }
                }, 2000)
            }, 5000)
        
        
        
        
        
    } else {
      if (connected) {
        showPopup('Tron LINK is disconnected.', 'error');
        connected = false;
      }
    } 
    
   }, 2000);
});
//----------------//
async function getBalanceOfAccount() {
  return tronWeb.trx.getBalance(currentAccount).then((res) => {
    const balance = parseInt(res / 1000000);
    if (balance) {
      $('#balance').text(balance);
    } else {
      $('#balance').text(0);
    }
  
      
    return balance;
  });
}
async function deposit() {
  let address = $('#refererAddress').val();
  let amount = $('#depositAmount').val();
  const contract = await tronWeb.contract().at(contractAddress);
  if (!tronWeb.isAddress(address) && parseInt(invested) < 1) {
    showPopup('Please Enter Right Address', 'error');
  } else if (amount < 50) {
    showPopup('Minimum Amount is 50 TRX', 'error');
  } else if (amount > (await getBalanceOfAccount())) {
    showPopup('Insufficient Balance', 'error');
  } else {
    if (parseInt(invested) > 0) {
      address = defaultSponsor;
    }
    if (window.tronWeb) {
      let contract = await tronWeb.contract().at(contractAddress);
      contract
        .deposit(address)
        .send({
          callValue: tronWeb.toSun(amount),
        })
        .then((output) => {
          console.info('Hash ID:', output, '\n');
          showPopup('Deposit Successful', 'success');
        });
    } else {
      showPopup('TronWeb is not Connected', 'error');
    }
  }
}
//withDraw your fund!
async function withdraw() {
  if (window.tronWeb) {
    let contract = await tronWeb.contract().at(contractAddress);
    await contract
      .withdraw()
      .send()
      .then((output) => {
        getBalanceOfAccount();
        console.info('HashId:' + ' ' + output);
        showPopup('Withdraw Successful', 'success');
      });
  } else {
    showPopup('TronWeb is not Connected', 'error');
  }
}
//reinvest your fund!
async function reinvest() {
  if (window.tronWeb) {
    let contract = await tronWeb.contract().at(contractAddress);
    await contract
      .reinvest()
      .send()
      .then((output) => {
        console.info('HashId:' + ' ' + output);
        showPopup('Reinvest Successful', 'success');
      });
  } else {
    showPopup('TronWeb is not Connected', 'error');
  }
}

/**
 * get total Invested
 * @param {*} contract
 */
async function getTotalInvested(contract) {
  let totalInvested = await contract.totalInvested().call();
  $('#totalInvested').text(
    thousands_separators(parseInt(totalInvested.toNumber() / 1000000))
  );
}

/**
 * get total Investors
 * @param {*} contract
 */
async function getTotalInvestors(contract) {
  let totalInvestors = await contract.totalPlayers().call();
  $('#totalInvestors').text(totalInvestors.toNumber());
}



/**
 * get Contract Balance Rate
 * @param {*} contract
 */
async function getContractBalanceRate(contract) {
  let contractbalanceRate = await contract.getContractBalanceRate().call();
  $('#roi').text((contractbalanceRate.toNumber() / 10 + 1).toFixed(1));
}


/**
 * get user payout 
 * @param {*} contract
 */
async function getuserpayout(contract) {
  let invester = await contract.players(currentAccount).call();
    const userpayout = invester.payoutSum.toNumber() / 1000000;
    $('#userpayout').text(userpayout.toFixed(2));
  
}

/**
 * get user referral info 
 * @param {*} contract
 */
async function getreferral(contract) {
  let invester = await contract.players(currentAccount).call();
    const refrewards = invester.affRewards.toNumber() / 1000000;
    const aff1 = invester.aff1sum.toNumber();
    const aff2 = invester.aff2sum.toNumber();
    const aff3 = invester.aff3sum.toNumber();
    const aff4 = invester.aff4sum.toNumber();
    $('#refrewards').text(refrewards.toFixed(2));
    $('#aff1').text(aff1);
    $('#aff2').text(aff2);
    $('#aff3').text(aff3);
    $('#aff4').text(aff4);
  
}





/**
 * get Deposit /and values of payout referral rewards and referral account
 * @param {*} contract
 */
async function getDeposit(contract) {
  let invester = await contract.players(currentAccount).call();
  const deposit = invester.trxDeposit.toNumber() / 1000000;
//  const userpayout = invester.payoutSum.toNumber() / 1000000;
  const refrewards = invester.affRewards.toNumber() / 1000000;
  const aff1 = invester.aff1sum.toNumber();
  const aff2 = invester.aff2sum.toNumber();
  const aff3 = invester.aff3sum.toNumber();
  const aff4 = invester.aff4sum.toNumber(); 
  if (deposit > 0) {
    $('#actualCapital').val(deposit.toFixed(6));
  } else {
    $('#actualCapital').val(0);
  }
  



/*if (userpayout > 0) {
    $('#uspayout').val(userpayout.toFixed(2));
  } else {
    $('#uspayout').val(0);
  } */

if (refrewards > 0) {
    $('#usrefrewards').val(refrewards.toFixed(2));
  } else {
    $('#uspayout').val(0);
  }

if (aff1 > 0) {
    $('#usaff1').val(aff1);
  } else {
    $('#usaff1').val(0);
  }

if (aff2 > 0) {
    $('#usaff2').val(aff2);
  } else {
    $('#usaff2').val(0);
  }

if (aff3 > 0) {
    $('#usaff3').val(aff3);
  } else {
    $('#usaff3').val(0);
  }

if (aff4 > 0) {
    $('#usaff4').val(aff4);
  } else {
    $('#usaff4').val(0);
  }


  return deposit.toFixed(6);
}

/**
 *
 * @param {*} contract
 */
async function getProfit(contract) {
  return await contract.getProfit(currentAccount).call();
}

function copy() {
  /* Get the text field */
  var copyText = document.getElementById('accountRef');

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand('copy');

  showPopup('Copied', 'success');
}

function thousands_separators(num) {
  var num_parts = num.toString().split('.');
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return num_parts.join('.');
}

/**
 * show Popup
 * @param {*} error
 */
function showPopup(msg, type) {
  $(`#popup-${type}-msg`).html(msg);

  $('.popup').removeClass('show');

  $(`.${type}-popover`).addClass('show');
  window.setTimeout(() => {
    $(`.${type}-popover`).removeClass('show');
  }, 3 * 1000);
}
