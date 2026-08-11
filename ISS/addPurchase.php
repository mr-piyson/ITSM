<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["poNumber"]) && !empty($_POST["poNumber"]) && isset($_POST["vendorID"]) && !empty($_POST["vendorID"])){
      date_default_timezone_set('Asia/Bahrain');
      $poNumber = htmlspecialchars($_POST['poNumber'], ENT_QUOTES);
      $mrnNumber = htmlspecialchars($_POST['mrnNumber'], ENT_QUOTES);
      $vendorID = htmlspecialchars($_POST['vendorID'], ENT_QUOTES);
      $currency = htmlspecialchars($_POST['currency'], ENT_QUOTES);
      $currentTotal = htmlspecialchars($_POST['currentTotal'], ENT_QUOTES);
      $vat = htmlspecialchars($_POST['vat'], ENT_QUOTES);
      $grandTotal = htmlspecialchars($_POST['grandTotal'], ENT_QUOTES);
      $quotationDate = htmlspecialchars($_POST['quotationDate'], ENT_QUOTES);
      $paidDate = htmlspecialchars($_POST['paidDate'], ENT_QUOTES);
      $buyer = htmlspecialchars($_POST['buyer'], ENT_QUOTES);
      $advanceRequest = htmlspecialchars($_POST['advanceRequest'], ENT_QUOTES);
      $LPO = htmlspecialchars($_POST['LPO'], ENT_QUOTES);
      $invoice = htmlspecialchars($_POST['invoice'], ENT_QUOTES);
      $deliveryNote = htmlspecialchars($_POST['deliveryNote'], ENT_QUOTES);
      $mrn = htmlspecialchars($_POST['mrn'], ENT_QUOTES);
      $forWho = htmlspecialchars($_POST['forWho'], ENT_QUOTES);
      $notes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $link = htmlspecialchars($_POST['link'], ENT_QUOTES);
      $serviceType = 0;
      if($_POST['poType'] == "Service"){
        $serviceType = 1;
      }
      if(isset($_POST["itemID"])){
        for ($i=0;$i<count($_POST["itemID"]);$i++){
          $_POST["itemID"][$i] = htmlspecialchars($_POST["itemID"][$i], ENT_QUOTES);
          $_POST["quantity"][$i] = htmlspecialchars($_POST["quantity"][$i], ENT_QUOTES);
          $_POST["price"][$i] = htmlspecialchars($_POST["price"][$i], ENT_QUOTES);
        }
      }
      if(isset($_POST["serviceName"])){
        for ($i=0;$i<count($_POST["serviceName"]);$i++){
          $_POST["serviceName"][$i] = htmlspecialchars($_POST["serviceName"][$i], ENT_QUOTES);
          $_POST["servicePrice"][$i] = htmlspecialchars($_POST["servicePrice"][$i], ENT_QUOTES);
        }
      }
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $poNumber);
      $input2 = mysqli_real_escape_string($mysqli, $mrnNumber);
      $input3 = mysqli_real_escape_string($mysqli, $vendorID);
      $input5 = mysqli_real_escape_string($mysqli, $currency);
      $input7 = mysqli_real_escape_string($mysqli, $currentTotal);
      $input8 = mysqli_real_escape_string($mysqli, $vat);
      $input9 = mysqli_real_escape_string($mysqli, $grandTotal);
      $input10 = mysqli_real_escape_string($mysqli, $quotationDate);
      $input11 = mysqli_real_escape_string($mysqli, $paidDate);
      $input12 = mysqli_real_escape_string($mysqli, $buyer);
      $input13 = mysqli_real_escape_string($mysqli, $advanceRequest);
      $input14 = mysqli_real_escape_string($mysqli, $LPO);
      $input15 = mysqli_real_escape_string($mysqli, $invoice);
      $input16 = mysqli_real_escape_string($mysqli, $deliveryNote);
      $input17 = mysqli_real_escape_string($mysqli, $mrn);
      $input18 = mysqli_real_escape_string($mysqli, $user);
      $input19 = mysqli_real_escape_string($mysqli, $forWho);
      $input20 = mysqli_real_escape_string($mysqli, $notes);
      $input25 = mysqli_real_escape_string($mysqli, $link);
      $input26 = mysqli_real_escape_string($mysqli, $serviceType);
      $sql = "INSERT INTO `purchase`(`vendorID`, `quotationDate`, `buyer`, `poNumber`, `forWho`, `notes`, `mrnNumber`, `currentTotal`, `vat`, `grandTotal`, `advanceRequest`, `LPO`, `invoice`, `deliveryNote`, `mrn`, `paidDate`, `user`, `currency`, `date`, `link`, `ServiceType`)";
      $sql = $sql . " VALUES (".$input3.",STR_TO_DATE('".$input10."', '%Y-%m-%d'),'".$input12."','".$input1."','".$input19."','".$input20."','".$input2."','".$input7."','".$input8."','".$input9."',".$input13.",".$input14.",".$input15.",".$input16.",".$input17.",STR_TO_DATE('".$input11."', '%Y-%m-%d'),".$input18.",'".$input5."',STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'".$input25."',".$input26.")";
      if($mysqli->query($sql) === TRUE){
        $iID = $mysqli->insert_id;
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input18.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','purchase',".$mysqli->insert_id.")";
        $mysqli->query($sqlLog);
        if($_POST['poType'] == "Service"){
          for ($i=0;$i<count($_POST["serviceName"]);$i++){
            $input21 = mysqli_real_escape_string($mysqli, $_POST["serviceName"][$i]);
            $input22 = mysqli_real_escape_string($mysqli, $_POST["servicePrice"][$i]);
            $sql2 = "INSERT INTO `purchaseServices`(`purchaseID`, `serviceName`, `servicePrice`) VALUES (".$iID.",'".$input21."',".$input22.")";
            if($mysqli->query($sql2) === FALSE){
              echo $sql2;
              include "header.php";
              echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
              echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
              die('<meta http-equiv="refresh" content="2;url=home.php" />');
            }
          }
        }else{
          for ($i=0;$i<count($_POST["itemID"]);$i++){
            $input21 = mysqli_real_escape_string($mysqli, $_POST["itemID"][$i]);
            $input22 = mysqli_real_escape_string($mysqli, $_POST["quantity"][$i]);
            $input23 = mysqli_real_escape_string($mysqli, $_POST["price"][$i]);
            $sql2 = "INSERT INTO `purchaseItems`(`purchaseID`, `itemID`, `quantity`, `price`) VALUES (".$iID.",".$input21.",".$input22.",'".$input23."')";
            $sql3 = "UPDATE `items` SET `stock` = `stock` + ".$input22." WHERE `id`=".$input21;
            if($mysqli->query($sql2) === FALSE || $mysqli->query($sql3) === FALSE){
              include "header.php";
              echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
              echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
              die('<meta http-equiv="refresh" content="2;url=home.php" />');
            }
          }
        }
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=home.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=home.php" />');
      }
      $mysqli->close();
    }else{
      die('<meta http-equiv="refresh" content="0;url=home.php" />');
    }
  }else{
    die('<meta http-equiv="refresh" content="0;url=home.php" />');
  }
?>
