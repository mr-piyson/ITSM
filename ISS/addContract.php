<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(
      isset($_POST["productName"])
      && !empty($_POST["productName"])
      && isset($_POST["vendorID"])
      && !empty($_POST["vendorID"])
      && isset($_POST["startDate"])
      && !empty($_POST["startDate"])
      && isset($_POST["endDate"])
      && !empty($_POST["endDate"])
      && isset($_POST["cost"])
    ){
      date_default_timezone_set('Asia/Bahrain');
      $product = htmlspecialchars($_POST['productName'], ENT_QUOTES);
      $vendorID = htmlspecialchars($_POST['vendorID'], ENT_QUOTES);
      $startDate = htmlspecialchars($_POST['startDate'], ENT_QUOTES);
      $endDate = htmlspecialchars($_POST['endDate'], ENT_QUOTES);
      $cost = htmlspecialchars($_POST['cost'], ENT_QUOTES);
      $currency = htmlspecialchars($_POST['currency'], ENT_QUOTES);
      $bilingCycle = htmlspecialchars($_POST['bilingCycle'], ENT_QUOTES);
      $account = htmlspecialchars($_POST['account'], ENT_QUOTES);
      $notes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $support = htmlspecialchars($_POST['support'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $product);
      $input2 = mysqli_real_escape_string($mysqli, $vendorID);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $input4 = mysqli_real_escape_string($mysqli, $startDate);
      $input5 = mysqli_real_escape_string($mysqli, $endDate);
      $input6 = mysqli_real_escape_string($mysqli, $cost);
      $input7 = mysqli_real_escape_string($mysqli, $currency);
      $input8 = mysqli_real_escape_string($mysqli, $bilingCycle);
      $input9 = mysqli_real_escape_string($mysqli, $account);
      $input10 = mysqli_real_escape_string($mysqli, $notes);
      $input11 = mysqli_real_escape_string($mysqli, $support);
      $sql = "INSERT INTO `contracts`(`productName`, `vendorID`, `startDate`, `endDate`, `notes`, `support`, `account`, `cost`, `currency`, `bilingCycle`, `inActive`)
              VALUES ('".$input1."',".$input2.",STR_TO_DATE('".$input4."', '%Y-%m-%d %H:%i:%s'),STR_TO_DATE('".$input5."', '%Y-%m-%d %H:%i:%s'),'".$input10."',
              '".$input11."','".$input9."','".$input6."','".$input7."','".$input8."',0)";
      if($mysqli->query($sql) === TRUE){
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','contract',".$mysqli->insert_id.")";
        $mysqli->query($sqlLog);
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=contracts.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=contracts.php" />');
      }
      $mysqli->close();
    }
  }
?>
