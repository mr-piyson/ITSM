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
      $row = $result->fetch_array(MYSQLI_ASSOC);
      echo "<script>document.getElementById('headerDiv').style.display='block';</script>";
      echo "<div class='w3-container w3-padding'>";
      echo "<div class='w3-padding w3-margin-top'>";
      echo "<a class='w3-small w3-btn w3-border' href='home.php'>BACK</a>";
      echo "</div>";
      echo "<h1 class='w3-padding title'>Tape List</h1>";
      echo "<div class='w3-row w3-padding w3-right'>";
      echo "<a class='w3-btn w3-border w3-small' onclick='showAddNewTape()'>Add New Tape</a>";
      echo "</div>";
      // echo "<div name='tapeBlocks' class='w3-quarter w3-padding tapleBlocks'>";
      ?>
      <style>
        .tapeBlocks{
          padding-bottom: 40px;
          display: block;
        }
        .tapeBlocks2{
          padding-bottom: 40px;
          display: block;
        }
      </style>
      <script>
        var tapeNamesForSearch = [];
        var tapeLocationForSearch = [];
        var tapeYearForSearch = [];
        var tapeMonthForSearch = [];
        var tapeMonth2ForSearch = [];
        var tapeSeqForSearch = [];
      </script>
      <div class="w3-margin-top w3-padding">
        <label style="color:#0b5266;">Search</label>
        <input id="tapeSearchInput" onkeyup="tapeSearch(event)" type="text" class="w3-input w3-border">
        <p id="resultP" class="w3-text-grey" style="margin:0;display:inline-block;">Tapes ()</p>
        <div style="display:inline-block;">
          <a id="AllFilterLink" onclick="filterTapes('All')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>All</a>
          <a id="JanuaryFilterLink" onclick="filterTapes('January')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>January</a>
          <a id="FebruaryFilterLink" onclick="filterTapes('February')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>February</a>
          <a id="MarchFilterLink" onclick="filterTapes('March')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>March</a>
          <a id="AprilFilterLink" onclick="filterTapes('April')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>April</a>
          <a id="MayFilterLink" onclick="filterTapes('May')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>May</a>
          <a id="JuneFilterLink" onclick="filterTapes('June')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>June</a>
          <a id="JulyFilterLink" onclick="filterTapes('July')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>July</a>
          <a id="AugustFilterLink" onclick="filterTapes('August')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>August</a>
          <a id="SeptemberFilterLink" onclick="filterTapes('September')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>September</a>
          <a id="OctoberFilterLink" onclick="filterTapes('October')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>October</a>
          <a id="NovemberFilterLink" onclick="filterTapes('November')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>November</a>
          <a id="DecemberFilterLink" onclick="filterTapes('December')" style='text-decoration:none;cursor:pointer;' class='w3-tag w3-small w3-light-grey'>December</a>
        </div>
        <div style="background:url('compact2.png')"></div>
      </div>
      <div id="mainDiv">
      <?php
      $sql2 = "SELECT * FROM `tapes` WHERE `inActive` = 0 ORDER BY `tapeID` DESC";
      if(!$result2 = $mysqli->query($sql2)){
        $mysqli->close();
        die("queryFailed");
      }
      if ($result2->num_rows > 0){
        $tapeID = 0;
        $counter = 0;
        while($row2 = $result2->fetch_assoc()){
          if($counter == 0){
            if(intval(explode("BFG",explode("L6",$row2["tapeID"])[0])[1]) > $tapeID){
              $tapeID = intval(explode("BFG",explode("L6",$row2["tapeID"])[0])[1]) + 1;
            }
            if($tapeID < 100 && $tapeID > 10){
              $tapeID = "0".$tapeID;
            }elseif($tapeID < 10){
              $tapeID = "00".$tapeID;
            }
          }
          $statuscolor = "red";
          if($row2["status"] == "Online"){
            $statuscolor = "green";
          }
          $cardlocation = "";
          if($row2["location"] == "IT"){
            $cardlocation = "IT - Server Room";
          }else{
            $cardlocation = "Production - Factory 2";
          }
          $tapeTag = str_replace(' ', '_', $row2['tapeDate']);
          $tapeName = "";
          $tapeLocation = "";
          $tapeDate = "";
          $tapeDescription = "";
          echo "<div id='blk".$counter."' class='w3-quarter w3-padding ".$row2["month"]."Month tapeBlocks'>";
          echo "<div  class='w3-light-grey w3-padding w3-card' style='display: block;'>";
          echo "<div class='w3-light-grey w3-padding' style='height:165px;position:relative;'>";
          echo "<h4 style='text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$row2["tapeID"]."</h4>";
          echo "<p style='margin:0;'><span class='w3-small w3-tag w3-".$statuscolor."'>".(empty($row2["status"]) ? "-" : ucfirst($row2["status"]))."</span>";
          echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".$cardlocation."</p>";
          echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["month"]) ? "-" : ucfirst($row2["month"]) . " - #".$row2['sequenceNum'])."</p>";
          echo "<p class='w3-text-grey' style='margin:0;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;'>".(empty($row2["year"]) ? "-" : ucfirst($row2["year"]))."</p>";
          echo "<div style='text-align:right;'><a href='tapeDetails.php?tape=".$row2['tapeID']."' class='w3-text-grey' style='text-decoration:underline;'>Details</a></div>";
          echo "</div></div></div>";
          $counter = $counter + 1;
          ?>
          <script>
            tapeMonthForSearch.push("<?php echo $row2['month']." ".$row2['year']; ?>");
            tapeNamesForSearch.push("<?php echo $row2['tapeID']; ?>");
            tapeLocationForSearch.push("<?php echo $cardlocation; ?>");
            tapeYearForSearch.push("<?php echo $row2['year']; ?>");
            tapeMonth2ForSearch.push("<?php echo $row2['month']; ?>");
            tapeSeqForSearch.push("<?php echo $row2['sequenceNum']; ?>");
          </script>
          <?php
        }
        ?>
        <script>
          window.onload = function(){
            calculateTapesTotal(tapeNamesForSearch.length);
            rearrange();
          }
        </script>
        <?php
      }
      echo "</div>";
      ?>
      </div>
      <div id="subMainDiv" style="display:none;"></div>
      <script>
        function showAddNewTape(){
          document.getElementById('addNewTapeInfo').style.display='block';
        }
        function tapeSearch(e){
          if ((document.getElementById('tapeSearchInput').value.trim().length > 1)){
            clearfilterStyle();
            document.getElementById('AllFilterLink').classList.remove('w3-light-grey');
            document.getElementById('AllFilterLink').classList.add('w3-blue');
            for (let x=0;x<document.getElementsByClassName('tapeBlocks').length;x++){
              document.getElementsByClassName('tapeBlocks')[x].style.display = "none";
            }
            var counter = 0;
            for (var i=0;i<tapeNamesForSearch.length;i++){
              if (tapeNamesForSearch[i].toUpperCase().includes(document.getElementById("tapeSearchInput").value.trim().toUpperCase()) ||
                  tapeLocationForSearch[i].toUpperCase().includes(document.getElementById("tapeSearchInput").value.trim().toUpperCase()) ||
                  tapeYearForSearch[i].toUpperCase().includes(document.getElementById("tapeSearchInput").value.trim().toUpperCase()) ||
                  tapeMonthForSearch[i].toUpperCase().includes(document.getElementById("tapeSearchInput").value.trim().toUpperCase())
                ){
                for (let n=0;n<document.getElementsByClassName('tapeBlocks').length;n++){
                  if(n == i){
                    document.getElementsByClassName('tapeBlocks')[n].style.display = "block";
                    counter = counter + 1;
                  }
                }
              }
            }
            calculateTapesTotal(counter);
          }else{
            for (let x=0;x<document.getElementsByClassName('tapeBlocks').length;x++){
              document.getElementsByClassName('tapeBlocks')[x].style.display = "block";
            }
            calculateTapesTotal(document.getElementsByClassName('tapeBlocks').length);
          }
          rearrange();
        }
        function filterTapes(tapeType){
          if(tapeType == "All"){
            for (let i=0;i<document.getElementsByClassName('tapeBlocks').length;i++){
              document.getElementsByClassName('tapeBlocks')[i].style.display = "block";
            }
            calculateTapesTotal(document.getElementsByClassName('tapeBlocks').length);
          }else{
            for (let i=0;i<document.getElementsByClassName('tapeBlocks').length;i++){
              document.getElementsByClassName('tapeBlocks')[i].style.display = "none";
            }
            for (let i=0;i<document.getElementsByClassName(tapeType+'Month').length;i++){
              document.getElementsByClassName(tapeType+'Month')[i].style.display = "block";
            }
            calculateTapesTotal(document.getElementsByClassName(tapeType+'Month').length);
          }
          clearfilterStyle();
          document.getElementById(tapeType+'FilterLink').classList.remove('w3-light-grey');
          document.getElementById(tapeType+'FilterLink').classList.add('w3-blue');
          document.getElementById('tapeSearchInput').value = "";
          rearrange();
        }
        function clearfilterStyle(){
          document.getElementById('AllFilterLink').classList.add('w3-light-grey');
          document.getElementById('JanuaryFilterLink').classList.add('w3-light-grey');
          document.getElementById('FebruaryFilterLink').classList.add('w3-light-grey');
          document.getElementById('MarchFilterLink').classList.add('w3-light-grey');
          document.getElementById('AprilFilterLink').classList.add('w3-light-grey');
          document.getElementById('MayFilterLink').classList.add('w3-light-grey');
          document.getElementById('JuneFilterLink').classList.add('w3-light-grey');
          document.getElementById('JulyFilterLink').classList.add('w3-light-grey');
          document.getElementById('AugustFilterLink').classList.add('w3-light-grey');
          document.getElementById('SeptemberFilterLink').classList.add('w3-light-grey');
          document.getElementById('OctoberFilterLink').classList.add('w3-light-grey');
          document.getElementById('NovemberFilterLink').classList.add('w3-light-grey');
          document.getElementById('DecemberFilterLink').classList.add('w3-light-grey');
          document.getElementById('AllFilterLink').classList.remove('w3-blue');
          document.getElementById('JanuaryFilterLink').classList.remove('w3-blue');
          document.getElementById('FebruaryFilterLink').classList.remove('w3-blue');
          document.getElementById('MarchFilterLink').classList.remove('w3-blue');
          document.getElementById('AprilFilterLink').classList.remove('w3-blue');
          document.getElementById('MayFilterLink').classList.remove('w3-blue');
          document.getElementById('JuneFilterLink').classList.remove('w3-blue');
          document.getElementById('JulyFilterLink').classList.remove('w3-blue');
          document.getElementById('AugustFilterLink').classList.remove('w3-blue');
          document.getElementById('SeptemberFilterLink').classList.remove('w3-blue');
          document.getElementById('OctoberFilterLink').classList.remove('w3-blue');
          document.getElementById('NovemberFilterLink').classList.remove('w3-blue');
          document.getElementById('DecemberFilterLink').classList.remove('w3-blue');
        }
        function calculateTapesTotal(x){
          document.getElementById("resultP").innerHTML = "Tapes ("+x+")";
        }
        function rearrange(){
          const months = {
            "January":1,
            "February":2,
            "March":3,
            "April":4,
            "May":5,
            "June":6,
            "July":7,
            "August":8,
            "September":9,
            "October":10,
            "November":11,
            "December":12,
          }
          var sortedArray = [];
          var sortedArray2 = [];
          var sortedArray3 = [];
          var blockedResult = [];
          var unsorted = [];
          for (var i = 0; i < document.getElementsByClassName('tapeBlocks').length; i++) {
            if(document.getElementsByClassName('tapeBlocks')[i].style.display != "none"){
              blockedResult.push(document.getElementsByClassName('tapeBlocks')[i].id.replace("blk",""));
            }
          }

          while (blockedResult.length > 0) {
            var lowestValueYear = 2100;
            var y = 0;
            for (var x = 0; x < blockedResult.length; x++) {
              if(tapeYearForSearch[blockedResult[x]] != ""){
                if(tapeYearForSearch[blockedResult[x]] < lowestValueYear){
                  lowestValueYear = tapeYearForSearch[blockedResult[x]];
                  y = x;
                }
              }
            }
            sortedArray.push({
              "id":blockedResult[y],
              "year":tapeYearForSearch[blockedResult[y]],
              "month":tapeMonth2ForSearch[blockedResult[y]],
              "seq":tapeSeqForSearch[blockedResult[y]]
            });
            //sortedArray.push(tapeYearForSearch[blockedResult[y]]);
            blockedResult.splice(y,1);
          }

          var yearsGroup = [];
          for (var n = 0; n < sortedArray.length; n++) {
            if(!yearsGroup.includes(sortedArray[n].year)){
              yearsGroup.push(sortedArray[n].year);
            }
          }

          for (var t = 0; t < yearsGroup.length; t++) {
            var grouped = [];
            var grouped2 = [];
            for (var r = 0; r < sortedArray.length; r++) {
              if(sortedArray[r].year == yearsGroup[t]){
                grouped.push(sortedArray[r]);
              }
            }

            while (grouped.length > 0) {
              var lowestValueMonth = 13;
              var m = 0;
              for (var xx = 0; xx < grouped.length; xx++) {
                if(parseInt(months[grouped[xx].month]) < parseInt(lowestValueMonth)){
                  lowestValueMonth = months[grouped[xx].month];
                  m = xx;
                }
              }
              sortedArray2.push(grouped[m]);
              grouped2.push(grouped[m]);
              grouped.splice(m,1);
            }

            var monthsGroup = [];
            for (var n = 0; n < grouped2.length; n++) {
              if(!monthsGroup.includes(grouped2[n].month)){
                monthsGroup.push(grouped2[n].month);
              }
            }

            for (var io = 0; io < monthsGroup.length; io++) {
              var grouped3 = [];
              for (var rr = 0; rr < grouped2.length; rr++) {
                if(grouped2[rr].month == monthsGroup[io]){
                  grouped3.push(grouped2[rr]);
                }
              }

              while (grouped3.length > 0) {
                var lowestValueSeq = 11;
                var p = 0;
                for (var xx = 0; xx < grouped3.length; xx++) {
                  if(parseInt(grouped3[xx].seq) < parseInt(lowestValueSeq)){
                    lowestValueSeq = grouped3[xx].seq;
                    p = xx;
                  }
                }
                sortedArray3.push(grouped3[p]);
                grouped3.splice(p,1);
              }

            }

          }

          rearrangeDivs(sortedArray3);
        }
        function rearrangeDivs(sortedReult){
          document.getElementById("mainDiv").style.display = "none";
          document.getElementById("subMainDiv").style.display = "block";
          document.getElementById("subMainDiv").innerHTML = "";
          for (var y = 0; y < sortedReult.length; y++) {
            for (var i = 0; i < document.getElementsByClassName('tapeBlocks').length; i++) {
              if(sortedReult[y].id == document.getElementsByClassName('tapeBlocks')[i].id.split("blk")[1]){
                let newDiv = document.createElement('div');
                newDiv.id = document.getElementsByClassName('tapeBlocks')[i].id;
                for (var j = 0; j < document.getElementsByClassName('tapeBlocks')[i].classList.length; j++) {
                  if(document.getElementsByClassName('tapeBlocks')[i].classList[j] != "tapeBlocks"){
                    newDiv.classList.add(document.getElementsByClassName('tapeBlocks')[i].classList[j]);
                  }
                }
                newDiv.classList.add("tapeBlocks2");
                newDiv.innerHTML = document.getElementsByClassName('tapeBlocks')[i].innerHTML;
                document.getElementById("subMainDiv").appendChild(newDiv);
              }
            }
          }
        }
      </script>

      <div id="addNewTapeInfo" class="w3-modal">
        <div class="w3-modal-content w3-animate-top" style="width:62.5vw !important;">
          <div class="w3-container" style="height:60vh;overflow:auto;background:#f9f9f9;">
            <div id="addNewHeaderDiv" style="display:none" class="w3-container w3-margin"></div>
            <div id="addNewTapeInfoDiv" class="w3-container w3-margin">
              <h2 class="title">New Tape Details</h2>
              <div class="w3-row">
                <form action="addNewTape.php" method="post">
                  <div>
                    <p>
                      <label>Tape ID</label>
                      <?php echo $row2["tapeID"]; ?>
                      <input name="TapeID" class="w3-input w3-border" type="text" value="<?php echo "BFG". $tapeID ."L6";?>">
                    </p>
                    <p>
                      <label>Tape Location</label>
                      <select name="Location" class="w3-select w3-border w3-padding w3-white" style="height:40px;">
                        <option value="IT">IT - Server Room</option>
                        <option value="Production">Production - Factory 2</option>
                      </select>
                    </p>
                    <div>
                      <label>Tape Description</label>
                      <br>
                      <select name="Month" class="w3-select w3-half w3-border w3-padding w3-white w3-margin-bottom" style="height:40.5px;width:49%;margin-right:10px;">
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
                      <input name="Year" class="w3-half w3-input w3-border w3-padding w3-margin-bottom" type="number" value="<?php echo date('Y'); ?>">
                    </div>
                    <input type="hidden" name="user" value="<?php echo $row["id"]; ?>">
                    <br>
                    <br>
                    <br>
                    <div id="addDiv" style="text-align:right;padding-top:22px;">
                      <input type="submit" class="w3-btn w3-left" style="background:#128cae;color:#fff;" value="ADD TAPE">
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="w3-container w3-light-grey w3-padding">
            <div class="w3-btn w3-right w3-white w3-border w3-small" onclick="document.getElementById('addNewTapeInfo').style.display='none'">Close</div>
          </div>
        </div>
      </div>

    <?php
    }
  }else{
    die("<meta http-equiv='refresh' content='0;url=index.php' />");
  }
?>
