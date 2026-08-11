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
    if(isset($_GET["tape"]) && !empty($_GET["tape"])){
      $row = $result->fetch_array(MYSQLI_ASSOC);
      $id = htmlspecialchars($_GET['tape'], ENT_QUOTES);
      $input2 = mysqli_real_escape_string($mysqli, $id);
      $sql2 = "SELECT * FROM `tapes` WHERE `tapeID`='".$input2."'";
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if($result2->num_rows > 0){
        $row2 = $result2->fetch_array(MYSQLI_ASSOC);
        echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      }
      ?>
      <script>
        function showUpdateTapeModal(){
          document.getElementById('updateTapeInfo').style.display='block';
        }
        function showFormatTapeModal(){
          document.getElementById('formatTapeInfo').style.display='block';
        }
        window.onload = function(){
          document.getElementsByName('Location')[0].value = "<?php echo $row2['location']; ?>";
          document.getElementsByName('Month')[0].value = "<?php echo $row2['month']; ?>";
          document.getElementsByName('Status')[0].value = "<?php echo $row2['status']; ?>";
          document.getElementsByName('SequenceNum')[0].value = "<?php echo $row2['sequenceNum']; ?>";
        }
      </script>
      <style>
        input,select,textarea{
          background: #f9f9f9 !important;
        }
        input:focus,select:focus,textarea:focus{
          background: #f7f1ef !important;
        }
        input[type=submit]{
          background:#0b5266 !important;
          color:#fff;
          width: 150px;
        }
        label{
          color:#0b5266;
        }
        h4{
          color:#1a61a3;
          margin: 0 !important;
          background: #f7f1ef !important;
        }
        h5{
          color:#0b5266;
          margin: 0 !important;
          font-size: 16px;
          font-family: Verdana,sans-serif;
          font-weight: bold;
          line-height: 1.5;
        }
      </style>
        <div class='w3-container w3-padding' style="padding-bottom:40px !important;">
          <div class='w3-padding'>
            <a class='w3-small w3-btn w3-border' href='tapes.php'>BACK</a>
          </div>
          <div>
            <h1 class='w3-padding title'>Tape Details</h1>
            <div class="w3-padding">
              <a class="w3-btn w3-border w3-small" onclick="showUpdateTapeModal()">Update Tape</a>
              <a class="w3-btn w3-border w3-small" onclick="showFormatTapeModal()">Format Tape</a>
            </div>
            <div class="w3-row">
              <div class="w3-padding w3-third">
                <div class="w3-card-2 w3-border w3-padding" style="background:#eefafd;">
                  <i>General Information<i>
                </div>
                <table class="w3-table w3-table-all w3-card-2 w3-margin-top">
                  <tr>
                    <td><b>Tape ID</b></td>
                    <td><?php echo $row2['tapeID']; ?></td>
                  </tr>
                  <tr>
                    <td><b>Description</b></td>
                    <td class="w3-half"><?php echo ucfirst($row2['month']); ?></td>
                    <td class="w3-half"><?php echo $row2['year']; ?></td>
                  </tr>
                  <tr>
                    <td><b>Status</b></td>
                    <td><?php echo ucfirst($row2['status']); ?></td>
                  </tr>
                  <tr>
                    <td><b>Sequence Number</b></td>
                    <td><?php echo $row2['sequenceNum']; ?></td>
                  </tr>
                  <tr>
                    <td><b>Last Written</b></td>
                    <td><?php echo date('m/d/Y h:i A', strtotime($row2['lastWritten'])); ?></td>
                  </tr>
                  <tr>
                    <td><b>Expires On</b></td>
                    <td><?php echo date('m/d/Y h:i A', strtotime($row2['expire'])); ?></td>
                  </tr>
                  <tr>
                    <td><b>Capacity</b></td>
                    <td><?php echo $row2['capacity']; ?></td>
                  </tr>
                  <tr>
                    <td><b>Free Space</b></td>
                    <td><?php echo $row2['free']; ?></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        <div id="formatTapeInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top">
            <div class="w3-container" style="height:450px;overflow:auto;background:#f9f9f9;">
              <div class="w3-container w3-margin">
                <h2 class="title w3-margin-bottom">Format Tape</h2><br>
                <h3>Are you sure you want to FORMAT this tape?</h3><br><br>
                <form action="formatTape.php" method="post">
                  <input type="hidden" name="tapeID" value="<?php echo $row2['tapeID']; ?>" />
                  <input type="hidden" name="user" value="<?php echo $row['id']; ?>" />
                  <input type="hidden" name="id" value="<?php echo $row2["id"]; ?>" />
                  <input class="w3-btn w3-margin top" type="submit" value="Format" />
                </form>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('formatTapeInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>
        <div id="updateTapeInfo" class="w3-modal">
          <div class="w3-modal-content w3-animate-top" style="width:62.5vw !important;">
            <div class="w3-container" style="height:79vh;overflow:auto;background:#f9f9f9;">
              <div id="updateHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
              <div id="updateTapeInfoDiv" class="w3-container w3-margin">
                <h2 class="title">Update Tape Details</h2>
                <form action="updateTape.php" method="post" enctype="multipart/form-data">
                  <input type="hidden" name="UpdateTapeID" value="<?php echo $row2['tapeID']; ?>" />
                  <div class="w3-row">
                    <div class="w3-half w3-padding">
                      <p>
                        <label>Tape ID</label><br>
                        <?php echo $row2['tapeID']; ?>
                      </p>
                      <p>
                        <label>Location</label>
                        <select name="Location" class="w3-select w3-border w3-padding w3-white">
                          <option value="IT">IT - Server Room</option>
                          <option value="Production">Production - Factory 2</option>
                        </select>
                      </p>
                      <label>Tape Description</label>
                      <br>
                      <select name="Month" class="w3-select w3-half w3-border w3-padding w3-white" style="height:40.5px;margin-right:5px;width:48%;">
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                      <input class="w3-half w3-input w3-border" name="Year" type="number" placeholder="<?php echo date('Y'); ?>" value="<?php echo $row2['year']; ?>" required />
                      <p>
                        <label>Status</label>
                        <select name="Status" class="w3-select w3-border w3-padding w3-white">
                          <option value="Online">Online</option>
                          <option value="Offline">Offline</option>
                        </select>
                      </p>
                      <p>
                        <label>Sequence Number</label>
                        <select name="SequenceNum" class="w3-select w3-border w3-padding w3-white">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </select>
                      </p>
                      <div id="updateDiv" style="text-align:right;padding-top:22px;">
                        <input type="submit" class="w3-btn w3-left" style="background:#128cae;color:#fff;" value="UPDATE" />
                      </div>
                    </div>
                    <div class="w3-half w3-padding">
                      <p>
                        <label>Last Written</label>
                        <input class="w3-input w3-border" name="LastWritten" type="datetime-local" value="<?php echo $row2['lastWritten']; ?>" required />
                      </p>
                      <p>
                        <label>Expire</label>
                        <input class="w3-input w3-border" name="Expire" type="datetime-local" value="<?php echo $row2['expire']; ?>" required />
                      </p>
                      <p>
                        <label>Capacity</label>
                        <input name="Capacity" class="w3-input w3-border" type="text" value="2.3 TB" readonly />
                      </p>
                      <p>
                        <label>Free</label>
                        <input name="Free" class="w3-input w3-border" type="text" value="<?php echo $row2['free']; ?>" required />
                      </p>
                      <input type="hidden" name="user" value="<?php echo $row["id"]; ?>" />
                      <input type="hidden" name="id" value="<?php echo $row2["id"]; ?>" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div class="w3-container w3-light-grey w3-padding">
              <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('updateTapeInfo').style.display='none'">Close</div>
            </div>
          </div>
        </div>
      </div>
      <?php
      }else{
        die("<meta http-equiv='refresh' content='0;url=index.php' />");
      }
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
