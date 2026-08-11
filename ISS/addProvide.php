<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["itemIDP"]) && !empty($_POST["itemIDP"]) && isset($_POST["provideQty"]) && !empty($_POST["provideQty"]) && isset($_POST["empID"]) && !empty($_POST["empID"]) && isset($_POST["RequestedBy"]) && !empty($_POST["RequestedBy"]) && isset($_POST["ReceivedBy"]) && !empty($_POST["ReceivedBy"]) && isset($_POST["providedBy"]) && !empty($_POST["providedBy"])){
      date_default_timezone_set('Asia/Bahrain');
      $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
      $RequestedBy = htmlspecialchars($_POST['RequestedBy'], ENT_QUOTES);
      $ReceivedBy = htmlspecialchars($_POST['ReceivedBy'], ENT_QUOTES);
      $providedBy = htmlspecialchars($_POST['providedBy'], ENT_QUOTES);
      $providedDate = htmlspecialchars($_POST['providedDate'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $notes = htmlspecialchars($_POST['notes'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input3 = mysqli_real_escape_string($mysqli, $empID);
      $input4 = mysqli_real_escape_string($mysqli, $RequestedBy);
      $input5 = mysqli_real_escape_string($mysqli, $ReceivedBy);
      $input6 = mysqli_real_escape_string($mysqli, $providedBy);
      $input7 = mysqli_real_escape_string($mysqli, $user);
      $input8 = mysqli_real_escape_string($mysqli, $notes);
      $input9 = mysqli_real_escape_string($mysqli, $providedDate);
      $sql = "INSERT INTO `provide`(`date`, `empID`, `requestBy`, `provideBy`, `recievedBy`, `notes`, `user`) VALUES (STR_TO_DATE('".$input9."', '%Y-%m-%d %H:%i:%s'),".$input3.",".$input4.",'".$input6."',".$input5.",'".$input8."',".$input7.")";
      if($mysqli->query($sql) === TRUE){
        $iID = $mysqli->insert_id;
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input7.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','provide',".$mysqli->insert_id.")";
        $mysqli->query($sqlLog);
        for ($i=0;$i<count($_POST["itemIDP"]);$i++){
          $itemID = htmlspecialchars($_POST['itemIDP'][$i], ENT_QUOTES);
          $provideQty = htmlspecialchars($_POST['provideQty'][$i], ENT_QUOTES);
          $input9 = mysqli_real_escape_string($mysqli, $itemID);
          $input10 = mysqli_real_escape_string($mysqli, $provideQty);
          $sql3 = "INSERT INTO `provideItems`(`itemID`, `quantity`, `provideID`) VALUES (".$input9.",".$input10.",".$iID.")";
          if($mysqli->query($sql3) === FALSE){
            include "header.php";
            echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
            echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
            die('<meta http-equiv="refresh" content="2;url=home.php" />');
          }else{
            $sql2 = "UPDATE `items` SET `stock`= `stock` - ".$input10." WHERE `id`=".$input9;
            if($mysqli->query($sql2) === FALSE){
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
