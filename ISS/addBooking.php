<?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST'){
    if(
      isset($_POST["empID"]) && !empty($_POST["empID"])
      && isset($_POST["assetID"]) && !empty($_POST["assetID"])
      && isset($_POST["purpose"]) && !empty($_POST["purpose"])
      && isset($_POST["startDate"]) && !empty($_POST["startDate"])
      && isset($_POST["endDate"]) && !empty($_POST["endDate"])
    ){
      date_default_timezone_set('Asia/Bahrain');
      $empID = htmlspecialchars($_POST['empID'], ENT_QUOTES);
      $assetID = htmlspecialchars($_POST['assetID'], ENT_QUOTES);
      $purpose = htmlspecialchars($_POST['purpose'], ENT_QUOTES);
      $otherInfo = htmlspecialchars($_POST['otherInfo'], ENT_QUOTES);
      $startDate = htmlspecialchars($_POST['startDate'], ENT_QUOTES);
      $endDate = htmlspecialchars($_POST['endDate'], ENT_QUOTES);
      $user = htmlspecialchars($_POST['user'], ENT_QUOTES);
      $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
      if ($mysqli->connect_errno) {
        die("connectionFailed");
      }
      $input1 = mysqli_real_escape_string($mysqli, $empID);
      $input2 = mysqli_real_escape_string($mysqli, $assetID);
      $input3 = mysqli_real_escape_string($mysqli, $user);
      $input4 = mysqli_real_escape_string($mysqli, $purpose);
      $input5 = mysqli_real_escape_string($mysqli, $startDate);
      $input6 = mysqli_real_escape_string($mysqli, $endDate);
      $input7 = mysqli_real_escape_string($mysqli, $otherInfo);
      $sql = "INSERT INTO `assetBooking`(`empID`, `assetID`, `bookingDate`, `returnDate`, `bookingPurpose`, `status`, `user`, `addedTime`, `otherInfo`)
      VALUES (".$input1.",".$input2.",STR_TO_DATE('".$input5."', '%Y-%m-%d'),STR_TO_DATE('".$input6."', '%Y-%m-%d'),'".$input4."','booked',
      ".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'".$input7."')";
      if($mysqli->query($sql) === TRUE){
        $isID = $mysqli->insert_id;
        $sql2 = "UPDATE `assets` SET `deviceStatus` = 'In Use' WHERE `id`=".$input2;
        $mysqli->query($sql2);
        $sqlLog = "INSERT INTO `changes_logs`(`userID`, `date`, `action`, `node`, `nodeID`) VALUES (".$input3.",STR_TO_DATE('".date('Y-m-d H:i:s')."', '%Y-%m-%d %H:%i:%s'),'add','booking',".$isID.")";
        $mysqli->query($sqlLog);

      $sql3 = "SELECT name FROM employees WHERE empID =".$input1;
      if($result3 = $mysqli->query($sql3)){
        $row3 = $result3->fetch_array(MYSQLI_ASSOC);
        require('res/PHPMailer.php');
        require('res/SMTP.php');
        $mail = new PHPMailer(true);
        $imagescontent= file_get_contents('emailFooter.png');
        $mail->CharSet = 'UTF-8';
        $mail->isSMTP();
        $mail->Host       = "smtp.office365.com";
        $mail->SMTPAuth   = true;
        $mail->Username   = "systems@bfginternational.com";
        $mail->Password   = "Mad51922";
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('systems@bfginternational.com', 'IT Service Management System');
        //$mail->addAddress($row3["email"]);
        $mail->addAddress('it@bfginternational.com');
        //$mail->addCC('it@bfginternational.com');
        $mail->isHTML(true);
        $mail->Subject = 'An IT asset has been booked for ' . $row3["name"] . ' - '.date('d-m-Y h:i a');
        $mail->Body    = 'The following asset "'.$assetID.'" has been booked for '.$row3["name"].' from '.date('d-m-Y', strtotime($startDate)).' until '.date('d-m-Y', strtotime($endDate)).'.<br>Please be sure to return it promptly.<br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
        <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
        $mail->send();
      }
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-green'>Added Successfully</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=bookingList.php" />');
      }else{
        include "header.php";
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
        echo "<h2 style='text-align:center;' class='w3-margin-top w3-red'>Failed</h2><center><h4>Redirecting ... </h4></center>";
        die('<meta http-equiv="refresh" content="2;url=home.php" />');
      }
    }
  }
?>
