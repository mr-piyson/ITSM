<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["actionType"]) && !empty($_POST["actionType"]) && isset($_POST["actionBy"]) && !empty($_POST["actionBy"])){
      date_default_timezone_set('Asia/Bahrain');
      $actionType = htmlspecialchars($_POST['actionType'], ENT_QUOTES);
      $actionBy = htmlspecialchars($_POST['actionBy'], ENT_QUOTES);
      $actionDate = htmlspecialchars($_POST['actionDate'], ENT_QUOTES);
      $actionNote = htmlspecialchars($_POST['actionNote'], ENT_QUOTES);
      $printerID = htmlspecialchars($_POST['printerID'], ENT_QUOTES);
      $tonerID = 0;
      if(($actionType == "Replaced" || $actionType == "Provided") && !empty($_POST['replacedToner'])){
        $tonerID = htmlspecialchars($_POST['replacedToner'], ENT_QUOTES);
      }
      $actionRequestedBy = "";
      $actionReceivedBy = "";
      if(isset($_POST["actionRequestedBy"]) && isset($_POST["actionReceivedBy"])){
        $actionRequestedBy = $_POST["actionRequestedBy"];
        $actionReceivedBy = $_POST["actionReceivedBy"];
      }
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $actionType);
      $input2 = mysqli_real_escape_string($mysqli, $actionBy);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $input4 = mysqli_real_escape_string($mysqli, $actionDate);
      $input5 = mysqli_real_escape_string($mysqli, $printerID);
      $input6 = mysqli_real_escape_string($mysqli, $actionNote);
      $input7 = mysqli_real_escape_string($mysqli, $tonerID);
      $input8 = mysqli_real_escape_string($mysqli, $actionRequestedBy);
      $input9 = mysqli_real_escape_string($mysqli, $actionReceivedBy);
      $sql = "INSERT INTO `printerActions`(`printerID`, `actionType`, `actionDate`, `actionBy`, `note`, `itemID`, `requestedBy`, `recievedBy`) VALUES (".$input5.",'".$input1."',STR_TO_DATE('".$input4."', '%Y-%m-%d %H:%i:%s'),'".$input2."','".$input6."',".$input7.",'".$input8."','".$input9."')";
      if($mysqli->query($sql) === TRUE){
        if($tonerID != 0){
          $sql2 = "UPDATE `items` SET `stock`= `stock` - 1 WHERE `id`=".$input7;
          if($mysqli->query($sql2) === FALSE){
            die('failed');
          }
        }
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','printerAction',".$input5.")";
        $mysqli->query($sqlLog);
        die("added");
      }else{
        die("failed");
      }
      $mysqli->close();
    }
  }
?>
