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
      $row = $result->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      ?>
      <div class="w3-container">
        <div class="w3-margin-top w3-padding">
          <h1 class="w3-padding title">Add New Printer</h1>
          <form class="w3-padding" action="addPrinter.php" method="post" enctype="multipart/form-data">
            <label>Name</label>
            <input class="w3-input w3-border" type="text" name="printerName" maxlength="100" required>
            <br>
            <label>Location</label>
            <input class="w3-input w3-border" type="text" name="printerLocation" maxlength="100" required>
            <br>
            <label>Used By</label>
            <input class="w3-input w3-border" type="text" name="printerUsedBy" maxlength="100" required>
            <br>
            <label>Department</label>
            <input class="w3-input w3-border" type="text" name="printerDepartment" maxlength="100">
            <br>
            <label>Link</label>
            <input class="w3-input w3-border" type="text" name="printerLink" maxlength="50">
            <p>
              <label>Image</label>
              <input name="file" class="w3-input w3-border" type="file" accept="image/*">
            </p>
            <input class="w3-check" type="checkbox" name="rollPrinter"> Roll Printer<br><br>
            <input type="hidden" name="user" value="<?php echo $row['id']; ?>">
            <input class="w3-btn" style="background:#128cae;color:#fff;" type="submit" value="Add Printer">
          </form>
        </div>
      </div>
      <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
