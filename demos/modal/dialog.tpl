<form class="text-start" is="gs-form">
    <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input name="email" type="email" class="form-control" placeholder="email" required="">
        <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input name="password" type="password" class="form-control" placeholder="enter password" required="">
    </div>
    <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" name="remember">
        <label class="form-check-label" for="exampleCheck1">Remember me</label>
    </div>
    <!--
        <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-primary me-1">Submit</button>        
            <button class="btn btn-secondary  ms-1">Cancel</button>
            <button class="btn btn-light ms-1">Reset</button>
        </div>
    -->
    <div class="row m-1">
        <div class="col"></div>
        <div class="col d-flex">
            <button type="submit" class="btn btn-primary me-1"  data-action="submit">Submit</button>        
            <button class="btn btn-secondary ms-1" data-action="cancel">Cancel</button>
        </div>
        <div class="col d-flex justify-content-end">
            <button type="reset" class="btn btn-light ms-1">Reset</button>
        </div>
    </div>    
</form>