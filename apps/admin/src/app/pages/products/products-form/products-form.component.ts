import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoriesService, Product, ProductsService } from '@bluebits/products';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil, timer } from 'rxjs';

@Component({
    selector: 'admin-products-form',
    templateUrl: './products-form.component.html',
    styles: []
})
export class ProductsFormComponent implements OnInit, OnDestroy {
    editMode = false;
    form: FormGroup;
    isSubmitted = false;
    categories = [];
    imageDisplay: string | ArrayBuffer;
    imageDisplays = [];
    currentProductId: string;
    endsubs$: Subject<any> = new Subject();

    constructor(
        private formBuilder: FormBuilder,
        private categoriesService: CategoriesService,
        private productsService: ProductsService,
        private messageService: MessageService,
        private location: Location,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this._initForm();
        this._getCategories();
        this._checkEditMode();
    }

    ngOnDestroy(): void {
        this.endsubs$.complete();
    }

    private _initForm() {
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            brand: ['', Validators.required],
            price: ['', Validators.required],
            priceMax: ['', Validators.required],
            thresholdCount: ['', Validators.required],
            timeCount: ['', Validators.required],
            category: ['', Validators.required],
            countInStock: ['', Validators.required],
            description: ['', Validators.required],
            richDescription: [''],
            image: ['', Validators.required],
            isFeatured: [false],
            images: ['']
        });
    }

    private _getCategories() {
        this.categoriesService
            .getCategories()
            .pipe(takeUntil(this.endsubs$))
            .subscribe((categories) => {
                this.categories = categories;
            });
    }

    private _addProduct(productData: FormData) {
        this.productsService
            .createProduct(productData)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (product: Product) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `Product ${product.name} is created!`
                    });
                    timer(2000)
                        .toPromise()
                        .then((done) => {
                            this.location.back();
                        });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Product cannot be created!'
                    });
                }
            );
    }

    private _updateProduct(productFormData: FormData) {
        this.productsService
            .updateProduct(productFormData, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Product is updated!'
                    });
                    timer(2000)
                        .toPromise()
                        .then((done) => {
                            this.location.back();
                        });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Product cannot be updated!'
                    });
                }
            );
    }

    private _checkEditMode() {
        this.route.params.pipe(takeUntil(this.endsubs$)).subscribe((params) => {
            if (params.id) {
                this.editMode = true;
                this.currentProductId = params.id;
                this.productsService.getProduct(params.id).subscribe((product) => {
                    console.log(product);
                    this.productForm.name.setValue(product.name);
                    this.productForm.category.setValue(product.category.id);
                    this.productForm.brand.setValue(product.brand);
                    this.productForm.price.setValue(product.price);
                    this.productForm.priceMax.setValue(product.priceMax);
                    this.productForm.thresholdCount.setValue(product.thresholdCount);
                    this.productForm.timeCount.setValue(product.timeCount);
                    this.productForm.countInStock.setValue(product.countInStock);
                    this.productForm.isFeatured.setValue(product.isFeatured);
                    this.productForm.description.setValue(product.description);
                    this.productForm.richDescription.setValue(product.richDescription);
                    this.imageDisplay = product.image;
                    if (product.images) {
                        // for(let i=0;i<product.images.length;i++){
                        //     this.imageDisplays.push();

                        // }
                        product.images.forEach((im) => {
                            this.imageDisplays.push(im);
                        });
                    }
                    this.productForm.images.setValidators([]);
                    this.productForm.images.updateValueAndValidity();

                    this.productForm.image.setValidators([]);
                    this.productForm.image.updateValueAndValidity();
                });
            }
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }
        const productFormData = new FormData();
        Object.keys(this.productForm).map((key) => {
            productFormData.append(key, this.productForm[key].value);
        });
        if (this.editMode) {
            this._updateProduct(productFormData);
        } else {
            this._addProduct(productFormData);
        }
    }

    onCancel() {
        this.location.back();
    }

    onImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.form.patchValue({ image: file });
            this.form.get('image').updateValueAndValidity();
            const fileReader = new FileReader();
            fileReader.onload = () => {
                this.imageDisplay = fileReader.result;
            };
            fileReader.readAsDataURL(file);
        }
    }

    onImages(e) {
        if (e.target.files) {
            const productFormData = new FormData();
            for (let i = 0; i < e.target.files.length; i++) {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    this.imageDisplays.push(fileReader.result);
                };
                fileReader.readAsDataURL(e.target.files[i]);

                productFormData.append('images', e.target.files[i]);
            }
            this._onUpdateMultipleImages(productFormData);
        }
    }

    // onSubmitImages() {
    //     this.isSubmitted = true;
    //     if (this.form.invalid) {
    //         return;
    //     }
    //     const productFormData = new FormData();

    //     Object.keys(this.productForm).map((key) => {
    //         console.log(key);
    //         console.log(this.productForm[key].value);
    //         productFormData.append(key, this.productForm[key].value);
    //     });
    //     console.log(productFormData);
    //     //  if (this.editMode) {
    //     this._onUpdateMultipleImages(productFormData);
    // }

    private _onUpdateMultipleImages(productFormData: FormData) {
        this.productsService
            .updatePics(productFormData, this.currentProductId)
            .pipe(takeUntil(this.endsubs$))
            .subscribe(
                (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Multiple pics are updated!'
                    });
                    // timer(2000)
                    //     .toPromise()
                    //     .then((done) => {
                    //         this.location.back();
                    //     });
                },
                (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Multiple pics cannot be updated!'
                    });
                }
            );
    }

    get productForm() {
        return this.form.controls;
    }
}

// [filter] = 'true';
// filterBy = 'name'[showClear] = 'true';
// placeholder = 'Select a Category';
