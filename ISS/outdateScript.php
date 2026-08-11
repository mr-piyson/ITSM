<?php
  require('res/PHPMailer.php');
  require('res/SMTP.php');
  date_default_timezone_set('Asia/Bahrain');
  $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
  if ($mysqli->connect_errno) {
    die("connectionFailed");
  }
  $sql = "SELECT ab.*,e.name as 'employeeName',a.deviceName, a.type, a.model from assetBooking ab
          LEFT join employees e
          ON e.empID = ab.empID
          LEFT join assets a
          ON a.id = ab.assetID
          WHERE ab.status != 'recieved' and ab.returnDate <= '".date('Y-m-d')."'";
  if(!$result = $mysqli->query($sql)){
    $mysqli->close();
    die("queryFailed");
  }
  if ($result->num_rows > 0){
    $emailSentence = "Outdated Asset Bookings: <br><br>";
    $emailSentence = $emailSentence ."<table style='border:1px solid;border-collapse: collapse;'>";
    $emailSentence = $emailSentence ."<tr>
    <td width='80' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Asset ID</b></td>
    <td width='80' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Asset Type</b></td>
    <td width='200' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Asset Model (Name)</b></td>
    <td width='200' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Other Info</b></td>
    <td width='200' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>For Employee</b></td>
    <td width='150' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Purpose</b></td>
    <td width='100' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Booking Date</b></td>
    <td width='100' style='border: 1px solid;border-collapse: collapse;padding:8px;'><b>Return Date</b></td>
    </tr>";
    $mail = new PHPMailer(true);
    $imagescontent= file_get_contents('/var/www/html/ISS/emailFooter.png');
    while($row = $result->fetch_assoc()){
      $emailSentence = $emailSentence ."<tr>
      <td width='80' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".$row['assetID']."</td>
      <td width='80' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".$row['type']."</td>
      <td width='200' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".$row['model']." (".$row["deviceName"].")</td>
      <td width='200' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".$row['otherInfo']."</td>
      <td width='200' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".$row["employeeName"]."(EmpID- ".$row['empID'].")</td>
      <td width='150' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".$row['bookingPurpose']."</td>
      <td width='100' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".date("d-m-Y", strtotime($row['bookingDate']))."</td>
      <td width='100' style='border: 1px solid;border-collapse: collapse;padding:8px;'>".date("d-m-Y", strtotime($row['returnDate']))."</td>
      </tr>";
      $mail->CharSet = 'UTF-8';
      $mail->isSMTP();
      $mail->Host       = "smtp.office365.com";
      $mail->SMTPAuth   = true;
      $mail->Username   = "systems@bfginternational.com";
      $mail->Password   = "Mad51922";
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      $mail->Port       = 587;
      $mail->setFrom('systems@bfginternational.com', 'IT Service Management System');
      $mail->addAddress('it@bfginternational.com');
      $mail->isHTML(true);
      $mail->Subject = 'Outdated Booked Asset';
      $mail->Body    = 'Dear '.$row["employeeName"].',<br><br>Your booked asset <b>('.$row['type'].': '.$row['model'].' - '.$row['deviceName'].')</b> was due to be returned on <b>'
      .date("d-m-Y", strtotime($row['returnDate'])).'</b>.<br>Please be sure to return it promptly.<br><br>If you would like to extend your booking, please reply back with the preferred time period.<br><br>Best Regards,<br><br><b>BFG IT Department</b><br><br>
      <img width="625" height="109" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
      $mail->send();
      $mail->ClearAllRecipients();
      $mail->ClearAttachments();
      //echo "email sent";
    }
    $emailSentence = $emailSentence ."</table>";
    $mail->CharSet = 'UTF-8';
    $mail->isSMTP();
    $mail->Host       = "smtp.office365.com";
    $mail->SMTPAuth   = true;
    $mail->Username   = "systems@bfginternational.com";
    $mail->Password   = "Mad51922";
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->setFrom('systems@bfginternational.com', 'IT Service Management System');
    $mail->addAddress('it@bfginternational.com');
    // $mail->addAddress('salman.almosawi@bfginternational.com');
    // $mail->addAddress('husain.rustam@bfginternational.com');
    // $mail->addCC('it@bfginternational.com');
    $mail->isHTML(true);
    $mail->Subject = 'Outdated Booked Assets Report: '.date('d-m-Y');

    $mail->Body    = 'The following Asset Bookings are overdue:-<br><br>'.$emailSentence.'<br><br>Best Regards,<br><br><b>BFG IT Department</b><br><br>
    <img width="625" height="109" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
    $mail->send();
    //echo "email sent";
  }
?>
