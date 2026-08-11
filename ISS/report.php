<?php
  include "header.php";
  if(isset($_SESSION['ISStoken']) && !empty($_SESSION['ISStoken'])){
    $mysqli = new mysqli('localhost', 'admin', '$Admin2629', 'ISS');
    if ($mysqli->connect_errno) {
      die("connectionFailed");
    }
    $token = $_SESSION['ISStoken'];
    $input1 = mysqli_real_escape_string($mysqli, $token);
    $sql = "SELECT * FROM `users` WHERE `token` = '".$input1."'";
    if(!$result = $mysqli->query($sql)){
      $mysqli->close();
      die("queryFailed");
    }
    if ($result->num_rows === 0){
      unset($_SESSION['ISStoken']);
      die("<meta http-equiv='refresh' content='0;url=index.php' />");
    }else{
      date_default_timezone_set('Asia/Bahrain');
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <div class="w3-container w3-padding">
        <div class="w3-row w3-card-2 w3-section w3-padding">
          <div class="w3-col m2 w3-padding">
            <div style="background:#128cae;color:#fff;">
              <a class="w3-btn" href="stockReport.php" style="width:100%;">
                <h4>Stock Report</h4>
              </a>
            </div>
          </div>
          <div class="w3-col m2 w3-padding">
            <div style="background:#128cae;color:#fff;">
              <a class="w3-btn" href="printersReport.php" style="width:100%;">
                <h4>Printers Report</h4>
              </a>
            </div>
          </div>
          <div class="w3-col m2 w3-padding">
            <div style="background:#128cae;color:#fff;">
              <a class="w3-btn" href="assetsReport.php" style="width:100%;">
                <h4>Assets Report</h4>
              </a>
            </div>
          </div>
        </div>
      </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
