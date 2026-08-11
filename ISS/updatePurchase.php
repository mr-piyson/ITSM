<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["poNumber"]) && !empty($_POST["poNumber"])){
      date_default_timezone_set('Asia/Bahrain');
      $poNumber = htmlspecialchars($_POST['poNumber'], ENT_QUOTES);
      $mrnNumber = htmlspecialchars($_POST['mrnNumber'], ENT_QUOTES);
      $quotationDate = htmlspecialchars($_POST['quotationDate'], ENT_QUOTES);
      $paidDate = htmlspecialchars($_POST['paidDate'], ENT_QUOTES);
      $forWho = htmlspecialchars($_POST['forWho'], ENT_QUOTES);
      $notes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $link = htmlspecialchars($_POST['link'], ENT_QUOTES);
      $purchaseID = htmlspecialchars($_POST['purchaseID'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      if(empty($quotationDate)){
        $quotationDate = "0000-00-00";
      }
      if(empty($paidDate)){
        $paidDate = "0000-00-00";
      }
      $input1 = mysqli_real_escape_string($mysqli, $poNumber);
      $input2 = mysqli_real_escape_string($mysqli, $mrnNumber);
      $input3 = mysqli_real_escape_string($mysqli, $quotationDate);
      $input4 = mysqli_real_escape_string($mysqli, $paidDate);
      $input5 = mysqli_real_escape_string($mysqli, $forWho);
      $input6 = mysqli_real_escape_string($mysqli, $notes);
      $input7 = mysqli_real_escape_string($mysqli, $purchaseID);
      $input8 = mysqli_real_escape_string($mysqli, $link);
      $sql = "UPDATE `purchase` SET `quotationDate`='".$input3."',`poNumber`=".$input1.",`forWho`='".$input5."',`notes`='".$input6."',`mrnNumber`='".$input2."',`paidDate`='".$input4."',`link`='".$input8."' WHERE `id`=".$input7;
      if($mysqli->query($sql) === TRUE){
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Updated Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=purchaseDetails.php?id='.$purchaseID.'&i=report" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=purchaseDetails.php?id='.$purchaseID.'&i=report" />');
      }
      $mysqli->close();
    }else{
      die('<meta http-equiv="refresh" content="0;url=home.php" />');
    }
  }else{
    die('<meta http-equiv="refresh" content="0;url=home.php" />');
  }
?>
