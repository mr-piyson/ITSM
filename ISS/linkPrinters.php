<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(isset($_POST["itemID"]) && !empty($_POST["itemID"]) && isset($_POST["printers"]) && !empty($_POST["printers"])){
      date_default_timezone_set('Asia/Bahrain');
      $printers = htmlspecialchars($_POST['printers'], ENT_QUOTES);
      $itemID = htmlspecialchars($_POST['itemID'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $itemID);
      $input2 = mysqli_real_escape_string($mysqli, $user);
      $printersAr = explode(",",$printers);
      $loopCount = count($printersAr) - 1;
      for ($i=0;$i<$loopCount;$i++){
        $input3 = mysqli_real_escape_string($mysqli, $printersAr[$i]);
        $sql = "INSERT INTO `printersToners`(`tonerID`, `PrinterID`) VALUES (".$input1.",".$input3.")";
        if($mysqli->query($sql) === TRUE){
          $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input2.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'linkPrinter','printersToners',".$mysqli->insert_id.")";
          $mysqli->query($sqlLog);
        }else{
          die("failed");
        }
      }
      $mysqli -> close();
      die("added");
    }
  }
?>
