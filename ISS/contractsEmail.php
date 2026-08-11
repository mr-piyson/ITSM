<?php
  date_default_timezone_set('Asia/Bahrain');
  $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
  if ($mysqli->connect_errno) {
    die("connectionFailed");
  }
  //$sql = "SELECT * FROM `contracts` WHERE `endDate` = DATE_ADD(`endDate`, INTERVAL -30 DAY) || DATE_ADD(`endDate`, INTERVAL -60 DAY) || DATE_ADD(`endDate`, INTERVAL -90 DAY)"
  $sql = "SELECT * FROM `contracts`";

  if(!$result = $mysqli->query($sql)){
    $mysqli->close();
    die("queryFailed");
  }

  if ($result->num_rows > 0){
    $emailSentence = "";
    $counter = 0;
    while($row = $result->fetch_assoc()){
      if(date('Y-m-d') == date('Y-m-d',strtotime($row['endDate']." -30 days")) || date('Y-m-d') == date('Y-m-d',strtotime($row['endDate']." -60 days")) || date('Y-m-d') == date('Y-m-d',strtotime($row['endDate']." -90 days"))){
        $counter = $counter + 1;
        echo date('Y-m-d')." => ".$row["endDate"]."\n";
        $emailSentence =  "<b>".$row["productName"].":</b><br><br>Vendor: ".$row['vendorID']."<br>Contract Started: ".$row['startDate']."<br>Contract Ends: ".$row["endDate"]."<br>Cost: ".$row['cost'];
        require('res/PHPMailer.php');
        require('res/SMTP.php');
        $mail = new PHPMailer(true);
        $imagescontent= file_get_contents('/var/www/html/ISS/emailFooter.png');
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
        $mail->Subject = 'Contract Renewal Reminder';
        $mail->Body    = 'The Contract for the following Service is due to be renewed:<br><br>'.$emailSentence.'<br><br>Best Regards,<br>BFG IT DEPARTMENT.<br>
        <img width="600" height="87" src="data:image/png;base64,' . base64_encode($imagescontent) . '"/>';
        $mail->send();
      }
    }
    if($counter == 0){
      echo date('Y-m-d')." ... No emails\n";
    }
  }
?>
